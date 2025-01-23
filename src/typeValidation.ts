import z from 'zod';

export const Signup= z.object({
    username: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional() 
});

export type signup= z.infer<typeof Signup> 


// signIn
export const SignIn= z.object({
    username: z.string().email(),
    password: z.string().min(6) 
});

export type siginIn= z.infer<typeof SignIn> 



//Create Blog

export const CreateBlog= z.object({
    title: z.string(),
    Content: z.string(),
    id: z.number()

});

export type createBlog= z.infer<typeof CreateBlog> 