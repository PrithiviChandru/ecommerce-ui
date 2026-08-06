import React, { useState } from 'react';
import { ShoppingBag, Tag } from 'lucide-react';
import { ProductsList } from './ProductsList';
import { CategoriesList } from './CategoriesList';

interface CatalogManagementProps {
  token: string;
  onBack: () => void;
}

export const CatalogManagement: React.FC<CatalogManagementProps> = ({ token, onBack }) => {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'categories'>('products');

  return (
    <div style={{ width: '100%', animation: 'fade-in 0.4s ease-out' }}>
      {/* Sub-tab Selection Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-card)',
        paddingBottom: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveSubTab('products')}
            style={{
              background: activeSubTab === 'products' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              border: activeSubTab === 'products' ? '1px solid var(--primary-500)' : '1px solid transparent',
              color: activeSubTab === 'products' ? 'white' : 'var(--text-secondary)',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => {
              if (activeSubTab !== 'products') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseOut={(e) => {
              if (activeSubTab !== 'products') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <ShoppingBag size={16} style={{ color: activeSubTab === 'products' ? 'var(--primary-400)' : 'inherit' }} />
            <span>Manage Products</span>
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            style={{
              background: activeSubTab === 'categories' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              border: activeSubTab === 'categories' ? '1px solid var(--primary-500)' : '1px solid transparent',
              color: activeSubTab === 'categories' ? 'white' : 'var(--text-secondary)',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => {
              if (activeSubTab !== 'categories') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseOut={(e) => {
              if (activeSubTab !== 'categories') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <Tag size={16} style={{ color: activeSubTab === 'categories' ? 'var(--primary-400)' : 'inherit' }} />
            <span>Manage Categories</span>
          </button>
        </div>

        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-300)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '4px 8px',
            transition: 'var(--transition-fast)'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'white'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--primary-300)'}
        >
          ← Back to Storefront
        </button>
      </div>

      {/* Render Active Manager */}
      {activeSubTab === 'products' ? (
        <ProductsList token={token} onBack={onBack} />
      ) : (
        <CategoriesList token={token} onBack={onBack} />
      )}
    </div>
  );
};
