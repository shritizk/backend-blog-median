import { Hono } from "hono";

// crypto
import { compareSync, hashSync } from "bcryptjs";
import {sign, verify} from 'hono/jwt';

// db
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
//const prisma = new PrismaClient().$extends(withAccelerate())

// type
import {siginIn , SignIn, Signup, signup} from '../typeValidation'

const userRoute= new Hono<{
    Bindings: {
        DATABASE_URL: string,
        jwt_secret: string
    },
    Variables: {
        userData: object |  Boolean      
}}>();



// api/v1/user/signup
userRoute.post('/signup',async (c)=>{ 
    
    try{
            const prisma = new PrismaClient({
                datasourceUrl: c.env.DATABASE_URL,
            }).$extends(withAccelerate());
            
            //body
            const body= await c.req.json();

            // type validation
            if(!Signup.parse(body)){
                return c.json({
                    key: "pls provide proper user input"
                })
            }
            
            // check if user Exist or not 
            const checkUser= await prisma.user.findUnique({
                where: {
                    username: body.username
                }
            });

            if(checkUser!=null){
                return c.json({
                    key: "userAlready exist!!"
                })
            };

            // crypto
            const hashedPassword= hashSync(body.password,10);
            
            // add user 
            const createUser= await prisma.user.create({
                data: {
                    name: body.name,
                    username: body.username,
                    password: hashedPassword
                }
            });
            
            // token
            const time= new Date();
            const token= await sign({id: createUser.id, data: createUser, date: time  },c.env.jwt_secret);
            
            // return 
            return c.json({
                token: token
            })
     

}catch(e){

    console.log(e);
    
    return c.json({
        error: e
    });
}
});

//  /api/v1/user/signin
userRoute.get('/signin',async (c)=>{
    
    try{
        
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
        
        //body
        const body= await c.req.json();

        // type validation
        if(!SignIn.parse(body)){
            return c.json({
                key: "pls provide proper user input"
            })
        }

        // check if user Exist or not 
        const checkUser= await prisma.user.findUnique({
            where: {
                username: body.username
            }
        }); 
         
        if(!checkUser){
            return c.json({
                key: "user does not exit !!"
            })
        };

        const compare= compareSync(body.password,checkUser.password);
        
        if(compare){

            const time= new Date(); 
            const token= await sign({id: body.id, data: body, date: time  },c.env.jwt_secret);

            return c.json({
                token: token
            });
        }else{
            return c.json({
                key: "wrong Password"
            })
        }

    }catch(e){
        return c.json({
            key: e
        })
    }

});

export default userRoute;