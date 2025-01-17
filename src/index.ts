import { Hono } from 'hono'

//routes
import userRoute from './routes/user'
import blogRoute from './routes/blog'

const app = new Hono()

app.route('/api/v1/user',userRoute);
app.route('/api/v1/blog',blogRoute);

export default app
