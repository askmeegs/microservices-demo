import { App } from './index';

const port = process.env.PORT || 8080;
const app = new App().app;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
