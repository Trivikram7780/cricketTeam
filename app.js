const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayers = `
    SELECT
    *
    FROM
    cricket_team
    ORDER BY
    player_id;

    `;
  const playersList = await db.all(getPlayers);
  response.send(playersList);
});

app.post("/players/", async (request, response) => {
  const memberDetails = request.body;
  const { playerName, jerseyNumber, role } = memberDetails;
  const queryPost = `INSERT INTO
    cricket_team (player_name, jersey_number,role)
    VALUES
    (
       '${playerName}',
        ${jerseyNumber},
        '${role}'
    );

    `;
  await db.run(queryPost);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT *
    FROM
    cricket_team
    WHERE 
    player_id = ${playerId};
    `;
  const player = await db.get(getPlayer);
  response.send(player);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `UPDATE 
    cricket_team
    SET
    player_name = '${playerName}' ,
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE 
    player_id = ${playerId};
    `;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE 
    FROM
    cricket_team 
    WHERE 
    player_id = ${playerId};
    `;
  db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
