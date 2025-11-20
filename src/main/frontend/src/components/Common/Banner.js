import BookSlider from "../Book/BookSlider";

function Banner({ type, limit = 40, hideSubtitle = true, category = "전체" }) {
    let apiUrl = "";
    if (type === "bestseller") {
        apiUrl = `http://localhost:8080/api/books/bestseller?limit=${limit}`;
    } else if (type === "newbest") {
        apiUrl = `http://localhost:8080/api/books/newbest?limit=${limit}`;
    } else {
        apiUrl = `http://localhost:8080/api/books/bestseller?limit=${limit}`;
    }

    return (
        <BookSlider
            apiUrl={apiUrl}
            hideSubtitle={hideSubtitle}
            category={category}
        />
    );
}

export default Banner;
