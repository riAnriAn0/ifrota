import AdminHome from "./pages/AdminHome";
import Login from "./pages/Login";

function App() {
  return (
     <>
      {/* <Login
        onLogin={(data) => {
          console.log("Login enviado:", data);
        }}
      /> */}
      <AdminHome
        adminName="Admin"
        onMenuClick={() => console.log("Abrir menu")}
        onNavigate={(route) => console.log("Ir para:", route)}
      />
    </>
  );
}

export default App;

