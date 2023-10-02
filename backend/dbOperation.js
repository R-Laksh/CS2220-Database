const config = require("./dbConfig");
const sql = require("mssql");

const getMutations2Data = async (filters) => {
  try {
    let pool = await sql.connect(config);
    let query = "SELECT * from dbo.hi";
    const conditions = [];

    for (const [key, value] of Object.entries(filters)) {
      switch (key) {
        case "mutationsCount":
          if (value === "0") {
            conditions.push(`Mutations2 = 'Wild'`);
          } else {
            conditions.push(
              `(LEN(Mutations2) - LEN(REPLACE(Mutations2, ',', '')) + 1) = @${key}`
            );
          }
          break;

        case "startsWith":
          conditions.push(
            `EXISTS (SELECT value FROM STRING_SPLIT(Mutations2, ',') WHERE value LIKE @${key})`
          );
          break;
        case "endsWith":
          conditions.push(
            `EXISTS (SELECT value FROM STRING_SPLIT(Mutations2, ',') WHERE value LIKE @${key})`
          );
          break;
        case "startsAndEndsWith":
          const [start, end] = value.split("-");
          conditions.push(
            `EXISTS (SELECT value FROM STRING_SPLIT(Mutations2, ',') WHERE value LIKE @start AND value LIKE @end)`
          );
          break;

        default:
          break;
      }
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    const request = pool.request();
    for (const [key, value] of Object.entries(filters)) {
      if (key === "startsWith") {
        request.input(key, sql.VarChar, value + "%");
      } else if (key === "endsWith") {
        request.input(key, sql.VarChar, "%" + value);
      } else if (key === "startsAndEndsWith") {
        const [start, end] = value.split("-");
        request.input("start", sql.VarChar, start + "%");
        request.input("end", sql.VarChar, "%" + end);
      } else {
        request.input(key, sql.VarChar, value);
      }
    }

    let data = await request.query(query);
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getData = async (filters) => {
  try {
    let pool = await sql.connect(config);
    let query = "SELECT * from dbo.hi";
    const conditions = [];

    for (const [key, value] of Object.entries(filters)) {
      const [column, operation] = key.split("_");

      switch (operation) {
        case "eq":
          conditions.push(`${column} = @${key}`);
          break;
        case "lt":
          conditions.push(`${column} < @${key}`);
          break;
        case "gt":
          conditions.push(`${column} > @${key}`);
          break;
        case "start":
          const endKey = `${column}_end`;
          if (filters[endKey]) {
            conditions.push(`${column} BETWEEN @${key} AND @${endKey}`);
          }
          break;
        case "notstart":
          const notEndKey = `${column}_notend`;
          if (filters[notEndKey]) {
            conditions.push(`${column} NOT BETWEEN @${key} AND @${notEndKey}`);
          }
          break;
        default:
          break;
      }
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    const request = pool.request();
    for (const [key, value] of Object.entries(filters)) {
      request.input(key, sql.VarChar, value);
    }

    let data = await request.query(query);
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  getData,
  getMutations2Data,
};
