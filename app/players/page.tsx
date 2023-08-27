"use client";
import React from "react";

type Player = {
  name: string;
  id: string;
};

export default function Players() {
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [playerName, setPlayerName] = React.useState("");

  const addPlayer = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const newPlayer = {
      name: playerName,
      id: crypto.randomUUID(),
    };

    setPlayers([...players, newPlayer]);
    setPlayerName("");
  };

  const deletePlayer = (id: string) => {
    const newPlayers = players.filter((p) => id !== p.id);
    setPlayers(newPlayers);
  };

  return (
    <main>
      <h1>Players!</h1>

      <form onSubmit={addPlayer}>
        <label htmlFor="player-name-field">Name:</label>
        <input
          style={{ color: "black" }}
          id="player-name-field"
          value={playerName}
          onChange={(event) => {
            setPlayerName(event.target.value);
          }}
        />
      </form>

      <table>
        {players.map((player) => (
          <tr key={player.id}>
            <td> {player.name} </td>
            <td>
              <button onClick={() => deletePlayer(player.id)}>Delete </button>
            </td>
          </tr>
        ))}
      </table>
    </main>
  );
}
