import Header from "./components/Header";
import AdminHome from "./pages/AdminHome";
import Login from "./pages/Login";
import TesteMapaViagem from "./pages/TesteMapaViagem";

export default function App() {
  return (
    <>
      <Header />
      {/* <Login
        onLogin={(data) => {
          console.log("Login enviado:", data);
        }}
      /> */}
      <AdminHome/>
      {/* <TesteMapaViagem /> */}
    </>
  );
}


