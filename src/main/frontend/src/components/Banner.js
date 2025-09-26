import BookSlider from "./BookSlider";

function Banner({ type }) {
    let apiUrl = "";
    if (type === "bestseller") {
        apiUrl = "http://localhost:8080/api/books/bestseller?limit=20";
    } else if (type === "newbest") {
        apiUrl = "http://localhost:8080/api/books/newbest?limit=20";
    }

    return (
        <div>
            <BookSlider apiUrl={apiUrl} />
        </div>
    );
}

export default Banner;
