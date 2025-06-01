import { useEffect, useState } from "react";
import PortalLayout from "../layout/PortalLayout";
import { useAuth } from "../auth/AuthProvider";
import { API_URL, API_URL_NEW } from "../auth/authConstants";
import { getRandomColor } from "../utils/getRandomColor";

interface Todo {
  id: string;
  title: string;
  category: string | { id: string | number; name: string };
  completed: boolean;
  status: "pending" | "completed";
  color: string;
  userId:string;
}

export default function Dashboard() {
  const auth = useAuth();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosC, setTodosC] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (auth.isAuthenticated) {
    getTodos();
    getTodosC();
    getCategories();
  }}, [auth.isAuthenticated]);

  async function getCategories() {
    try {
      const response = await fetch(`${API_URL_NEW}/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });

      if (response.ok) {
        const json = await response.json();
        console.log('categorias', json)
        //const names = json.map((c: { name: string }) => c.name);
        setCategories(json);
      }
    } catch (error) {
      console.error("Error al obtener categorías", error);
    }
  }
// extraemos las completadas
//http://localhost:3000/tasks/completed
  async function getTodosC() {
    
    try {
      
      const response = await fetch(`${API_URL_NEW}/tasks/completed`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });

      if (response.ok) {
        const json = await response.json();
        console.log(json)
        setTodosC(json);
      }
    } catch (error) {
      console.log(error);
    }
  }
//
  async function getTodos() {

    try {
      
      const response = await fetch(`${API_URL_NEW}/tasks/pending`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },

      });

      if (response.ok) {
        const json = await response.json();
        console.log('tareas guardas en el back',json)
        setTodos(json);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function createTodo() {
    //console.log('token? :', `Bearer ${auth.getAccessToken()}`)
    if (title.length > 1 && categoryId) {
       const userId = auth.getUser()?.id;
       //console.log(category,userId,title)
       // console.log('userId',userId)
        if (!userId) {
          console.error("No hay usuario autenticado");
          return;
        }
      try {
        const response = await fetch(`${API_URL_NEW}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.getAccessToken()}`,
          },
          body: JSON.stringify({
            title,
            categoryId,
            userId,
          }),
        });
        
        if (response.ok) {
          const newTodo = (await response.json()) as Todo;
          
          setTodos([...todos, newTodo]);
          setTitle("");
          setCategory("");
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function markAsCompleted(id: string) {
    try {
      const response = await fetch(`${API_URL_NEW}/tasks/${id}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
        body: JSON.stringify({ completed: true }),
      });

      if (response.ok) {
        setTodos(prev =>
          prev.map(todo =>
            todo.id === id ? { ...todo, completed: true } : todo
          )
        );
        await getTodosC();
      }
    } catch (error) {
      console.log(error);
    }
  }

    async function Delete(id: string) {
    try {
      const response = await fetch(`${API_URL_NEW}/tasks/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });

      if (response.ok) {
        setTodos(prev =>
          prev.map(todo =>
            todo.id === id ? { ...todo, completed: true } : todo
          )
        );
        await getTodosC();
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createTodo();
  }
  const userId = auth.getUser()?.id;
  console.log('userId',userId)
  const pendingTodos = todos.filter(t => !t.completed && t.userId == userId ).slice(-6);
  const completedTodos = todosC.filter(t => (t.status === "completed" || t.completed) && t.userId == userId).slice(-6);

  return (
    <PortalLayout>
      <div className="dashboard">
        <h1>Dashboard Tareas</h1>

        <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Nueva tarea..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <button type="submit">Crear</button>
        </form>

        <section>
          <h2>Pendientes</h2>
          {pendingTodos.length === 0 && <p>No hay tareas pendientes.</p>}
          {pendingTodos.map(todo => (
            <div
              key={todo.id}
              style={{
                backgroundColor: todo.color,
                padding: "1rem",
                marginBottom: "0.5rem",
                borderRadius: "5px",
              }}
            >
              <strong>{todo.title}</strong> - {typeof todo.category === "object" ? todo.category.name : todo.category}

              <button
                style={{ float: "right" }}
                onClick={() => markAsCompleted(todo.id)}
              >
                Finalizar
              </button>
              <button
                style={{ float: "right" }}
                onClick={() => Delete(todo.id)}
              >
                Eliminar
              </button>

            </div>
          ))}
        </section>

        <section>
          <h2>Finalizadas</h2>
          {completedTodos.length === 0 && <p>No hay tareas finalizadas.</p>}
          {completedTodos.map(todo => (
            <div
              key={todo.id}
              style={{
                backgroundColor: todo.color,
                padding: "1rem",
                marginBottom: "0.5rem",
                borderRadius: "5px",
              }}
            > 
              <strong>{todo.title}</strong> - {typeof todo.category === "object" ? todo.category.name : todo.category}
              <button
                style={{ float: "right" }}
                onClick={() => Delete(todo.id)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </section>
      </div>
    </PortalLayout>
  );
}
