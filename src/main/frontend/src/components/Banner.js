import BookSlider from "./BookSlider";

function Banner({ type }) {
    let apiUrl = "";
    if (type === "bestseller") {
        apiUrl = "http://localhost:8080/api/books/bestseller?limit=20";
    } else if (type === "picks") {
        apiUrl = "http://localhost:8080/api/books/picks?categoryId=1&limit=20";
    }

    return (
        <div>
            <BookSlider apiUrl={apiUrl} />
        </div>
    );
}

export default Banner;
