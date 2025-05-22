import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const PageBuilder = () => {
  // Layout state with some initial cards
  const [layouts, setLayouts] = useState({
    lg: [
      { i: 'card1', x: 0, y: 0, w: 6, h: 4 },
      { i: 'card2', x: 6, y: 0, w: 6, h: 4 },
      { i: 'card3', x: 0, y: 4, w: 12, h: 4 },
    ]
  });

  // Load saved layout from localStorage on mount
  useEffect(() => {
    const savedLayouts = localStorage.getItem('page-layouts');
    if (savedLayouts) {
      setLayouts(JSON.parse(savedLayouts));
    }
  }, []);

  // Save layout changes to localStorage
  const handleLayoutChange = (layout, layouts) => {
    localStorage.setItem('page-layouts', JSON.stringify(layouts));
    setLayouts(layouts);
  };

  // Card components with different styles
  const cards = {
    card1: {
      title: 'Basic Card',
      content: 'Drag me around and resize me!',
      className: 'bg-white'
    },
    card2: {
      title: 'Primary Card',
      content: 'This card has a different style.',
      className: 'bg-blue-100'
    },
    card3: {
      title: 'Full Width Card',
      content: 'This card spans the full width by default.',
      className: 'bg-green-100'
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Page Builder</h1>
        <p className="text-gray-600">Drag and resize cards to customize your layout</p>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
      >
        {Object.entries(cards).map(([id, card]) => (
          <div
            key={id}
            className={`rounded-lg shadow-lg p-4 ${card.className}`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <div className="cursor-move text-gray-500">
                ⋮⋮
              </div>
            </div>
            <p>{card.content}</p>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default PageBuilder;