import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { addTodo, deleteTodo, updateStatus, updatetodo, updatetodoimage } from "../Redux/todoSlice";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { TextField, Button, Grid, Typography, Alert, Box, AppBar, Toolbar } from "@mui/material";

const validation = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  endDate: Yup.date().required("End date is required"),
  image: Yup.mixed().required("Image is required"),
});

// Convert image to Base64 for localStorage persistence
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const TodoPage = () => {
  const dispatch = useDispatch();
  const { todostorage } = useSelector((state) => state.todoKey);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({ resolver: yupResolver(validation) });

  const [editingTodo, setEditingTodo] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const onSubmit = async (data) => {
    if (editingTodo) {
      const updatedTodo = {
        ...editingTodo,
        title: data.title,
        description: data.description,
        endDate: data.endDate,
      };

      dispatch(updatetodo({ id: editingTodo.id, updatedTodo }));

      // If a new image is selected, convert to Base64 and update
      if (data.image[0]) {
        const base64Image = await toBase64(data.image[0]);
        dispatch(updatetodoimage({ id: editingTodo.id, updatedTodo: { image: base64Image } }));
      }

      setAlertMessage("Todo Updated Successfully!");
      setEditingTodo(null);
    } else {
      const base64Image = await toBase64(data.image[0]);
      const newTodo = {
        id: Date.now(),
        title: data.title,
        description: data.description,
        endDate: data.endDate,
        image: base64Image,
        isCompleted: false,
      };
      dispatch(addTodo(newTodo));
      setAlertMessage("Todo Added Successfully!");
    }
    reset();
    setImagePreview(null);
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setValue("title", todo.title);
    setValue("description", todo.description);
    setValue("endDate", todo.endDate);
    setImagePreview(todo.image);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Todo App
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        p={3}
        sx={{
          minHeight: "100vh",
          // background: "linear-gradient(to right, #ff7e5f, #feb47b)",
        }}
      >
        {alertMessage && <Alert severity="success">{alertMessage}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid
            container
            spacing={2}
            maxWidth={500}
            margin="auto"
            mb={3}
            sx={{
              background: "white",
              padding: 3,
              borderRadius: 2,
              border: '1px solid rgba(177, 177, 177, 0.8)'
            }}
          >
            {/* Title Field (Row 1) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </Grid>

            {/* Description Field (Row 2) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
                multiline
                rows={3}
              />
            </Grid>

            {/* Date Field (Row 3) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                {...register("endDate")}
                error={!!errors.endDate}
                helperText={errors.endDate?.message}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Upload Image Button (Row 4) */}
            <Grid item xs={12}>
              <input
                type="file"
                accept="image/*"
                id="imageUpload"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <label htmlFor="imageUpload">
                <Button variant="contained" component="span" color="primary" fullWidth>
                  Upload Image
                </Button>
              </label>
            </Grid>

            {/* Image Preview (Row 5) */}
            {imagePreview && (
              <Grid item xs={12} display="flex" justifyContent="center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  width="100"
                  height="100"
                  style={{ borderRadius: 10, border: "2px solid #ccc" }}
                />
              </Grid>
            )}

            {/* Submit Button (Row 6) */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color={editingTodo ? "secondary" : "primary"}
                fullWidth
              >
                {editingTodo ? "Update ToDo" : "Add ToDo"}
              </Button>
            </Grid>
          </Grid>
        </form>


        {/* Todo Table */}
        <Box className="ag-theme-alpine" sx={{ height: 400, width: "100%", background: "white", padding: 2, borderRadius: 2 }}>
          <AgGridReact
            rowData={todostorage}
            columnDefs={[
              { headerName: "Title", field: "title", sortable: true },
              { headerName: "Description", field: "description" },
              { headerName: "End Date", field: "endDate" },
              { headerName: "Image", field: "image", cellRenderer: (params) => <img src={params.value} alt="todo" width="50" height="50" style={{ borderRadius: 5 }} /> },
              { headerName: "Completed", field: "isCompleted", cellRenderer: (params) => <span>{params.value ? "✔ Completed" : " Pending"}</span> },
              {
                headerName: "Actions",
                minWidth: 220,
                cellRenderer: (params) => (
                  <Box display="flex" gap={1} paddingLeft={0}>
                    <Button variant="contained" color="success" size="small" onClick={() => handleEdit(params.data)}>
                      Edit
                    </Button>
                    <Button variant="contained" color="warning" size="small" onClick={() => dispatch(updateStatus(params.data.id))}>
                      Status
                    </Button>
                    <Button variant="contained" color="error" size="small" sx={{ paddingX: 1.5 }} onClick={() => dispatch(deleteTodo(params.data.id))}>
                      Delete
                    </Button>
                  </Box>
                ),
              },
            ]}
          />
        </Box>
      </Box>
    </>
  );
};

export default TodoPage;



// import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as Yup from "yup";
// import { addTodo, deleteTodo, updateStatus, updatetodo } from "../Redux/todoSlice";
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";


// const validation = Yup.object().shape({
//   title: Yup.string().required("Title is required"),
//   description: Yup.string().required("Description is required"),
//   endDate: Yup.date().required("End date is required"),
//   image: Yup.mixed().required("Image is required"),
// });

// const TodoPage = () => {
//   const dispatch = useDispatch();
//   const { todostorage } = useSelector((state) => state.todoKey);

//   const { register, handleSubmit, formState: { errors }, reset, setValue, } = useForm({ resolver: yupResolver(validation), });

//   const [editingTodo, setEditingTodo] = useState(null);

//   const onSubmit = (data) => {
//     if (editingTodo) {

//       const updatedTodo = {
//         ...editingTodo,
//         title: data.title,
//         description: data.description,
//         endDate: data.endDate,
//         image: data.image[0]
//           ? URL.createObjectURL(data.image[0])
//           : editingTodo.image,
//       };
//       dispatch(updatetodo({ id: editingTodo.id, updatedTodo }));
//       setEditingTodo(null);
//     } else {

//       const newTodo = {
//         id: Date.now(),
//         title: data.title,
//         description: data.description,
//         endDate: data.endDate,
//         image: URL.createObjectURL(data.image[0]),
//         isCompleted: false,
//       };
//       dispatch(addTodo(newTodo));
//     }
//     reset();
//   };

//   const handleEdit = (todo) => {
//     setEditingTodo(todo);
//     setValue("title", todo.title);
//     setValue("description", todo.description);
//     setValue("endDate", todo.endDate);
//     setValue("image", null);
//   };

//   const columns = [
//     { headerName: "Title", field: "title", sortable: true },
//     { headerName: "Description", field: "description" },
//     { headerName: "End Date", field: "endDate" },
//     {
//       headerName: "Image",
//       field: "image",
//       cellRenderer: (params) => (
//         <img src={params.value} alt="todo" width="50" height="50" />
//       ),
//     },
//     {
//       headerName: "Completed",
//       field: "isCompleted",
//       cellRenderer: (params) => (
//         <span>{params.value ? "✔ Completed" : " Pending"}</span>
//       ),
//     },
//     {
//       headerName: "Actions",
//       cellRenderer: (params) => (
//         <div style={{ display: "flex", gap: "10px" }}>
//           <button
//             onClick={() => handleEdit(params.data)}
//             style={{ backgroundColor: "green", color: "white", border: "none",height:'25px' }}
//           >
//             Edit
//           </button>
//           <button
//             onClick={() => dispatch(updateStatus(params.data.id))}
//             style={{ backgroundColor: "yellowgreen", color: "white", border: "none" }}
//           >
//             Status
//           </button>
//           <button
//             onClick={() => dispatch(deleteTodo(params.data.id))}
//             style={{ backgroundColor: "red", color: "white", border: "none", width: '150px' }}
//           >
//             Delete
//           </button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1 style={{ textAlign: "center" }}>TODO LIST</h1>
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           gap: "10px",
//           maxWidth: "400px",
//           margin: "0 auto 20px auto",
//         }}
//       >

//         <input
//           placeholder="Title"
//           {...register("title")}
//           style={{
//             padding: "10px",
//             borderRadius: "4px",
//             border: "1px solid #ccc",
//           }}
//         />
//         <p style={{ color: "red" }}>{errors.title?.message}</p>


//         <textarea
//           placeholder="Description"
//           {...register("description")}
//           style={{
//             padding: "10px",
//             borderRadius: "4px",
//             border: "1px solid #ccc",
//             minHeight: "50px",
//           }}
//         />
//         <p style={{ color: "red" }}>{errors.description?.message}</p>


//         <input
//           type="date"
//           {...register("endDate")}
//           style={{
//             padding: "10px",
//             borderRadius: "4px",
//             border: "1px solid #ccc",
//           }}
//         />
//         <p style={{ color: "red" }}>{errors.endDate?.message}</p>


//         <input
//           type="file"
//           {...register("image")}
//           accept="image/*"
//           style={{
//             padding: "10px",
//             borderRadius: "4px",
//             border: "1px solid #ccc",
//           }}
//         />
//         <p style={{ color: "red" }}>{errors.image?.message}</p>


//         <button
//           type="submit"
//           style={{
//             backgroundColor: editingTodo ? "blue" : "#007BFF",
//             color: "white",
//             border: "none",
//             padding: "10px",
//             borderRadius: "4px",
//             cursor: "pointer",
//           }}
//         >
//           {editingTodo ? "Update ToDo" : "Add ToDo"}
//         </button>
//       </form>


//       <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
//         <AgGridReact rowData={todostorage} columnDefs={columns} />
//       </div>
//     </div>

//   );
// };

// export default TodoPage;
