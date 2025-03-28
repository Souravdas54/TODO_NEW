import { createSlice } from "@reduxjs/toolkit";

const getdataLocalStorage = () => {
    const savedTodos = localStorage.getItem("todostorage");
    return savedTodos ? JSON.parse(savedTodos) : [];
  };
  
  
  const savedatalStorage = (data) => {
    localStorage.setItem("todostorage", JSON.stringify(data));
  };
const initialState = {
  todostorage:getdataLocalStorage(),
};

export const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo: (state, action) => {
        state.todostorage.push(action.payload);
        savedatalStorage(state.todostorage);
    },
    deleteTodo: (state, action) => {
      state.todostorage = state.todostorage.filter(
        (todo) => todo.id !== action.payload
      );
      savedatalStorage(state.todostorage);
    },
    updateStatus: (state, action) => {
      const index = state.todostorage.findIndex(
        (todo) => todo.id === action.payload
      );
      if (index !== -1) {
        state.todostorage[index].isCompleted = !state.todostorage[index].isCompleted;
        savedatalStorage(state.todostorage); 
      }
    },
    updatetodo: (state, action) => {
        const { id, updatedTodo } = action.payload;
        const index = state.todostorage.findIndex((todo) => todo.id === id);
        if (index !== -1) {
          state.todostorage[index] = { ...state.todostorage[index], ...updatedTodo };
          savedatalStorage(state.todostorage);
        }
      },

      
       updatetodoimage: (state, action) => {
        const { id, updatedTodo } = action.payload;
        const index = state.todostorage.findIndex((todo) => todo.id === id);

        if (index !== -1) {
            state.todostorage[index] = {
                ...state.todostorage[index], 
                ...updatedTodo, 
                image: updatedTodo.image || state.todostorage[index].image 
            };

            
            savedatalStorage([...state.todostorage]); 
        }
    },
  },
});

export const { addTodo, deleteTodo, updateStatus,updatetodo,updatetodoimage } = todoSlice.actions;
export default todoSlice.reducer;
