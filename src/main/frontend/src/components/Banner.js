import BookSlider from "./BookSlider";

function Banner({ type }) {
    let apiUrl = "";
    if (type === "bestseller") {
        apiUrl = "http://localhost:8080/books/bestseller";
    } else if (type === "picks") {
        apiUrl = "http://localhost:8080/books/picks";
    }

    return (
        <div>
            <BookSlider apiUrl={apiUrl} />
        </div>
    );
}

export default Banner;
