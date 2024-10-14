import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Function to format the date
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options); // Format to a readable one
};

// Function to parse the formatted date string back to Date object
const parseDate = (dateString) => {
  const months = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11,
  };

  const [day, month, year] = dateString.split(" de ");
  return new Date(year, months[month.toLowerCase()], day); // Construct a Date object
};

function App() {
  const [users, setUsers] = useState([]);
  const [registrationsPerDay, setRegistrationsPerDay] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            dni: data.dni, // Assuming 'dni' is stored in the user data
            registrationDate: formatDate(data.registrationDate), // Format the date
          };
        });

        // Sort users by registration date (oldest to newest)
        usersList.sort(
          (a, b) =>
            parseDate(a.registrationDate) - parseDate(b.registrationDate)
        );

        setUsers(usersList);

        // Count registrations per day
        const countByDate = {};
        usersList.forEach((user) => {
          const date = user.registrationDate;
          countByDate[date] = (countByDate[date] || 0) + 1;
        });
        setRegistrationsPerDay(countByDate);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Registro de usuarios | Cerveceria Santa Fe</h1>
      <div>
        <h2>Total de registros por día:</h2>
        <ul>
          {Object.entries(registrationsPerDay).map(([date, count]) => (
            <li key={date}>
              {date}: {count} registro{count > 1 ? "s" : ""}
            </li>
          ))}
        </ul>
      </div>
      <h2>Registros:</h2>
      <div>
        {users.length === 0 ? (
          <p>Cargando data...</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  DNI
                </th>
                <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                  Día de registro
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ border: "1px solid #ddd" }}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {user.id}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {user.dni}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {user.registrationDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
