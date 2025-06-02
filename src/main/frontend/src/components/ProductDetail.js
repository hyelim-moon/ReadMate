import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`http://localhost:8080/api/products/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('상품을 불러올 수 없습니다.');
                return res.json();
            })
            .then(data => setProduct(data))
            .catch(err => setError(err.message));
    }, [id]);

    if (error) return <p style={{ color: 'red', padding: '1rem' }}>{error}</p>;
    if (!product) return <p>로딩 중...</p>;

    return (
        <div style={{ padding: '2rem' }}>
            <button onClick={() => navigate(-1)}>← 뒤로가기</button>
            <h2>{product.name}</h2>
            <img src={`http://localhost:8080${product.image}`} alt={product.name} style={{ maxWidth: '300px', width: '100%', borderRadius: '8px' }} />
            <p>가격: {product.price} P</p>
            <p>상품 상세 내용(필요 시 추가)</p>
        </div>
    );
}

export default ProductDetail;
