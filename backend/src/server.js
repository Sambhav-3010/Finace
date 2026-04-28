import app from "./app.js";

const port = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});
