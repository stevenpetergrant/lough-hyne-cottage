// Simple client-side routing for booking pages
(function() {
  const path = window.location.pathname;
  
  // Define booking page redirects
  const bookingRoutes = {
    '/sauna-booking': '/booking?type=sauna',
    '/yoga-booking': '/booking?type=yoga', 
    '/bread-booking': '/booking?type=bread',
    '/cabin-booking': '/booking?type=cabin'
  };
  
  // Check if current path needs redirect
  if (bookingRoutes[path]) {
    window.location.href = bookingRoutes[path];
  }
})();