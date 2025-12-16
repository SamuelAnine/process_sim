import { connectToDB } from "@/utils/database";
import User from  "@/models/users";
import bcrypt from "bcrypt"
import slugify from "slugify";

export const POST = async (req) => {
    const { name, username, email, password } = await req.json();


    try {
        await connectToDB();

        const user = await User.findOne({ email: email });

        if (user) {
            console.log('for where')
            return new Response(JSON.stringify({ message: 'User with that email already exists' }), { status: 301})
        }

        const userDetails = await User.findOne({username: username})
        if (userDetails) {
            return new Response(JSON.stringify({ message: 'User name is taken, please use another one'}), { status: 301 })
        }


        const saltRounds = 10;
        
        let hashed_password = await bcrypt.hash(password, saltRounds);
        let profile = slugify(`${process.env.NEXTAUTH_URL}/profile/${username}`).toLocaleLowerCase();
        let roledesc = '';

        const newUser = new User({ name, username, email, hashed_password, profile, roledesc});

        newUser.save();

        return new Response(JSON.stringify({message: 'Signup successful! Continue to signin'}), { status: 201 })


    } catch (error) {
        console.log('Signup error:', error)
        return new Response(JSON.stringify(error), { status: 500})
    }
}
