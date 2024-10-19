'use client'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {Auth} from "@/Firebase/firebase.config";
import { useState } from "react";
import { BeatLoader } from "react-spinners";
import { useRouter } from "next/navigation";

export const description =
    "A simple login form with email and password. The submit button says 'Sign in'."

export function LoginForm() {
    const auth = Auth;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter()

    const HandleLogin = () => {
        setLoading(true)
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                router.push('/dashboard', {})
                // ...
                setLoading(false)
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setLoading(false)
            });
    }
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Connexion</CardTitle>
                <CardDescription>
                    Entrez votre email ci-dessous pour vous connecter à votre compte.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input value={email} onChange={(e)=> setEmail(e.target.value)} type="email" placeholder="m@example.com"  required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={HandleLogin}>
                    {loading ? (
                        <BeatLoader color="white" size={10} />
                    ):(
                        <span>
                            Se connecter
                        </span>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}