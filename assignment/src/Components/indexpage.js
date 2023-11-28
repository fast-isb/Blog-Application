import { useEffect } from "react"

export default function Index() {
    useEffect(() => {
        fetch('http://localhost:4000/post')
        .then(response => {
            response.json().then(posts => {
                console.log(posts);
            });
        });
    }, []);
    return (
        <>

        </>
    )
}