import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

// Helper function to get product image path based on product name and category
function getProductImage(product) {
  if (product.image_url) {
    return product.image_url;
  }
  
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  
  // Map backend product names to image files
  const nameMap = {
    // Dog Food
    'premium dog food': '/images/Dog Food – Adult Lamb 3kg.jpg',
    'dog food': '/images/Dog Food – Adult Lamb 3kg.jpg',
    
    // Cat Food  
    'cat food': '/images/Cat Food – Adult Salmon 1.5kg.jpg',
    'kitten': '/images/Cat Food – Kitten Chicken 2kg.jpg',
    
    // Cat Litter
    'cat litter': '/images/Clumping Cat Litter 10L.jpg',
    'litter box': '/images/Clumping Cat Litter 10L.jpg',
    
    // Treats
    'treat': category.includes('cat') ? '/images/Cat Treat – Cheese Flavored Crunch 50g.jpg' : '/images/Dog Treat Biscuit – Chicken 200g.jpg',
    'chew bone': '/images/Dog Chew Bone – Mini (5-Pack).jpg',
    
    // Collars
    'collar': category.includes('cat') ? '/images/Adjustable Cat Collar with Bell.jpg' : '/images/Small Breed Dog Nylon Collar.jpg',
    
    // Leashes & Harnesses
    'harness': '/images/Chest Harness for Medium Dogs.jpg',
    'leash': '/images/Automatic Retractable Leash 5m.jpg',
    
    // Bowls
    'bowl': '/images/Stainless Steel Food Bowl (Cat:Small Dog).jpg',
    'ceramic': '/images/Non-Slip Ceramic Cat Bowl.jpg',
    'dual': '/images/Dual Compartment Plastic Food-Water Bowl.jpg',
    'water': '/images/Automatic Water Dispenser 1.5L.jpg',
    
    // Toys
    'ball': '/images/Cat Ball with Bell (3-Pack).jpg',
    'fishing': '/images/Cat Fishing Rod with Feather.jpg',
    'plush': '/images/Plush Dog Toy (Bite Resistant).jpg',
    'rope': '/images/Rope Tug Toy for Dogs.jpg',
    'toy': category.includes('cat') ? '/images/Cat Ball with Bell (3-Pack).jpg' : '/images/Plush Dog Toy (Bite Resistant).jpg',
    
    // Grooming
    'shampoo': '/images/Dog Shampoo (Sensitive Skin).jpg',
    'comb': '/images/Fur Comb (Cat:Dog).jpg',
    'wipe': '/images/Pet Cleaning Wipes (50 Pack).jpg',
    'cleaning': '/images/Pet Cleaning Wipes (50 Pack).jpg',
  };
  
  // Try exact name match first
  for (const [key, imagePath] of Object.entries(nameMap)) {
    if (name.includes(key)) {
      return imagePath;
    }
  }
  
  // Fallback based on category
  if (category.includes('food')) {
    if (category.includes('dog') || name.includes('dog')) {
      return '/images/Dog Food – Adult Lamb 3kg.jpg';
    } else if (category.includes('cat') || name.includes('cat')) {
      return '/images/Cat Food – Adult Salmon 1.5kg.jpg';
    }
  } else if (category.includes('treat')) {
    return category.includes('cat') ? '/images/Cat Treat – Cheese Flavored Crunch 50g.jpg' : '/images/Dog Treat Biscuit – Chicken 200g.jpg';
  } else if (category.includes('toy')) {
    return '/images/Plush Dog Toy (Bite Resistant).jpg';
  } else if (category.includes('accessories')) {
    return '/images/Adjustable Cat Collar with Bell.jpg';
  }
  
  // Last resort: default image
  return '/images/dog-adult-lamb.jpeg';
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  // Handle missing quantity_in_stock - default to available if not specified
  const quantity = product.quantity_in_stock ?? 1;
  const isOutOfStock = quantity === 0;
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking add to cart
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div 
      className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-image">
        <img 
          src={getProductImage(product)} 
          alt={product.name}
          onError={(e) => {
            // Fallback to default image if main image fails
            e.target.src = '/images/dog-adult-lamb.jpeg';
          }}
        />
        {isOutOfStock && <div className="stock-badge">Out of Stock</div>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-details">
          <div className="product-price">₺{product.price.toFixed(2)}</div>
          {product.quantity_in_stock !== undefined && (
            <div className="product-stock">
              In Stock: {product.quantity_in_stock}
            </div>
          )}
          <div className="product-category">{product.category}</div>
        </div>
        <button 
          className="add-to-cart-button" 
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          title={isOutOfStock ? 'This product is out of stock' : 'Add to cart'}
          style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;