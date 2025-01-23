import { Hono } from "hono";

const blogRoute = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        jwt_secret: string
    },
    Variables: {
        userId: string
    }

}>();

// db
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

// zod


//crypto
import { verify } from "hono/jwt";
//const prisma = new PrismaClient().$extends(withAccelerate())

// middleware
blogRoute.use('/*', async (c, next) => {
    try {

        const token = c.req.header("authorization") || "";
        const user = await verify(token, c.env.jwt_secret);

        if (user) {
            c.set("userId", JSON.stringify(user.id));
            await next();
        }
        else {
            return c.json({
                message: "you are not authorized"
            })
        }
    }
    catch (e) {

        return c.json({
            error: e
        })
    }
});

// POST /api/v1/blog
blogRoute.post('/', async (c) => {

    try {

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        //body
        const body = await c.req.json();
        const authorId = c.get('userId');

        const blogCreated = await prisma.blog.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: Number(authorId)
            }
        });

        return c.json({
            id: blogCreated.id
        })
    }
    catch (e) {

        return c.json({
            error: e
        })
    }
});

// PUT /api/v1/blog
blogRoute.put('/', async (c) => {
    try {

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        //body
        const body = await c.req.json();

        //check if this blog even exist
        const blogData = await prisma.blog.findUnique({
            where: {
                id: body.id
            }
        });

        if (blogData != null) {

            const blogCreated = await prisma.blog.update({
                where: {
                    id: body.id
                },
                data: {
                    title: body.title,
                    content: body.content

                }
            });

            return c.json({
                msg: "updated"
            });
        }
        else {
            return c.json({
                error: "this blog does not exist "
            })
        }
    } catch (e) {
        return c.json({
            error: e
        })
    }
});



// get blog
blogRoute.get('/', async (c) => {

    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const titles = await prisma.blog.findMany();

        return c.json({
            title: titles
        });
    }
    catch (e) {
        return c.json({
            error: e
        });
    }

});


// GET /api/v1/blog/:id
blogRoute.get('/user/blog/:id', async (c) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const id = c.req.param('id');
        
        // conver id into a number 
        const num_id= parseInt(id);

        //if id not given 
        if(isNaN(num_id)){
            return c.json({
                msg: "id not given "
            })
        };

        const blog = await prisma.blog.findUnique({
            where: {
               id: num_id  
            }
        });

        return c.json({
            data: blog
        })
    } catch (e) {
        return c.json({
            error: e
        });
    }
});
export default blogRoute