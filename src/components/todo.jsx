import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import supabase from "../supabase.js";
import "../css/todo.css";

function Todo() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetch, setFetch] = useState(false);
  const [todos, setTodos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  // ADD OR UPDATE TODO
  const addTodo = async () => {
    if (!input.trim()) return;

    try {
      setLoading(true);

      let result;

      if (editId !== null) {
        // UPDATE TODO
        result = await supabase
          .from("todos")
          .update({ title: input.trim() })
          .eq("id", editId);
      } else {
        // ADD TODO
        result = await supabase.from("todos").insert([{ title: input.trim() }]);
      }

      if (result.error) {
        console.log(result.error.message);
        return;
      }

      setInput("");
      setEditId(null);
      setFetch((prev) => !prev);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // GET ALL TODOS
  const getAllTodos = async () => {
    try {
      setFetchLoading(true);

      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error(error.message);
        return;
      }

      setTodos(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setFetchLoading(false);
    }
  };

  // DELETE TODO
  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);

      if (error) {
        console.log(error.message);
        return;
      }

      setFetch((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  // EDIT TODO
  const editTodo = (item) => {
    setInput(item.title);
    setEditId(item.id);
  };

  // FETCH DATA
  useEffect(() => {
    getAllTodos();
  }, [fetch]);

  return (
    <div className="todo-page">
      <div className="todo-wrapper">
        {/* HEADER */}
        <header className="todo-header">
          <div className="logo">
            <span>✓</span>
          </div>

          <h1>TaskFlow</h1>

          <p>Organize your work. Simplify your life.</p>
        </header>

        {/* MAIN CARD */}
        <div className="todo-card">
          <div className="card-heading">
            <div>
              <h2>My Tasks</h2>
              <p>Manage your daily activities</p>
            </div>

            <div className="task-count">{todos.length} Tasks</div>
          </div>

          {/* INPUT */}
          <div className="input-group">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTodo();
              }}
            />

            <button className="add-btn" onClick={addTodo} disabled={loading}>
              {loading ? (
                <ClipLoader size={18} color="#fff" />
              ) : editId !== null ? (
                "Update Task"
              ) : (
                "+ Add Task"
              )}
            </button>
          </div>

          {/* TASK LIST */}
          <div className="task-list">
            <div className="list-heading">
              <h3>Your Tasks</h3>
              <span>{todos.length} items</span>
            </div>

            {fetchLoading ? (
              <div className="empty-state">
                <ClipLoader size={35} color="#6366f1" />
                <p>Loading tasks...</p>
              </div>
            ) : todos.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No tasks yet!</h3>
                <p>Add your first task and get things done.</p>
              </div>
            ) : (
              todos.map((item) => (
                <div className="task" key={item.id}>
                  <div className="task-info">
                    <div className="task-icon">✓</div>

                    <div>
                      <h4>{item.title}</h4>
                      <p>Personal Task</p>
                    </div>
                  </div>

                  <div className="task-actions">
                    {/* EDIT BUTTON */}
                    <button
                      className="edit-btn"
                      title="Edit Task"
                      onClick={() => editTodo(item)}
                    >
                      ✏️
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      className="delete-btn"
                      title="Delete Task"
                      onClick={() => deleteTodo(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FOOTER */}
          <div className="todo-footer">
            <span>✨ Stay focused and productive!</span>
            <span>TaskFlow © 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Todo;
