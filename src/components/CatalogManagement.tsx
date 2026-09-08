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
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveSubTab('products')}
            style={{
              background: activeSubTab === 'products' ? 'var(--primary-600)' : '#ffffff',
              border: activeSubTab === 'products' ? '1px solid var(--primary-600)' : '1.5px solid #cbd5e1',
              color: activeSubTab === 'products' ? '#ffffff' : '#334155',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition-fast)',
              boxShadow: activeSubTab === 'products' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none'
            }}
          >
            <ShoppingBag size={16} style={{ color: activeSubTab === 'products' ? '#ffffff' : '#4f46e5' }} />
            <span>Manage Products</span>
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            style={{
              background: activeSubTab === 'categories' ? 'var(--primary-600)' : '#ffffff',
              border: activeSubTab === 'categories' ? '1px solid var(--primary-600)' : '1.5px solid #cbd5e1',
              color: activeSubTab === 'categories' ? '#ffffff' : '#334155',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition-fast)',
              boxShadow: activeSubTab === 'categories' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none'
            }}
          >
            <Tag size={16} style={{ color: activeSubTab === 'categories' ? '#ffffff' : '#4f46e5' }} />
            <span>Manage Categories</span>
          </button>
        </div>

        <button
          onClick={onBack}
          style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            color: 'var(--primary-600)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '10px',
            transition: 'var(--transition-fast)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = 'var(--primary-500)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
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
