// Application State
let currentPage = "home"
let isMobileMenuOpen = false
const chartData = {
  subscribers: [
    { month: "Jan", subscribers: 1200 },
    { month: "Feb", subscribers: 1350 },
    { month: "Mar", subscribers: 1580 },
    { month: "Apr", subscribers: 1820 },
    { month: "May", subscribers: 2100 },
    { month: "Jun", subscribers: 2450 },
    { month: "Jul", subscribers: 2800 },
    { month: "Aug", subscribers: 3200 },
    { month: "Sep", subscribers: 3650 },
    { month: "Oct", subscribers: 4100 },
    { month: "Nov", subscribers: 4600 },
    { month: "Dec", subscribers: 5200 },
  ],
  videos: [
    { title: "How to Edit Like a Pro", views: 45000, likes: 2300 },
    { title: "My Morning Routine", views: 38000, likes: 1900 },
    { title: "Tech Review 2024", views: 52000, likes: 2800 },
  ],
}

// Navigation Functions
function navigateTo(page) {
  showLoadingState()

  setTimeout(() => {
    // Hide all pages
    document.querySelectorAll(".page").forEach((p) => {
      p.classList.remove("active")
    })

    // Show selected page
    const targetPage = document.getElementById(page + "-page")
    if (targetPage) {
      targetPage.classList.add("active")
      currentPage = page

      // Update navigation active states
      updateNavigation()

      // Initialize charts if navigating to dashboard
      if (page === "dashboard") {
        setTimeout(() => {
          initializeChartsWithErrorHandling()
        }, 100)
      }

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      console.error(`Page ${page} not found`)
    }

    hideLoadingState()
  }, 300)
}

function updateNavigation() {
  // Update all navigation buttons (both desktop and mobile)
  document.querySelectorAll("button").forEach((btn) => {
    const onclick = btn.getAttribute("onclick")
    if (onclick && onclick.includes("navigateTo")) {
      btn.classList.remove("text-red-600", "font-medium")
      btn.classList.add("text-gray-600")
    }
  })

  // Highlight current page buttons
  document.querySelectorAll("button").forEach((btn) => {
    const onclick = btn.getAttribute("onclick")
    if (onclick && onclick.includes(`navigateTo('${currentPage}')`)) {
      btn.classList.remove("text-gray-600")
      btn.classList.add("text-red-600", "font-medium")
    }
  })
}

// Mobile Menu Functions
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu")
  isMobileMenuOpen = !isMobileMenuOpen

  if (isMobileMenuOpen) {
    mobileMenu.classList.add("active")
    document.body.style.overflow = "hidden"
  } else {
    mobileMenu.classList.remove("active")
    document.body.style.overflow = ""
  }
}

// Loading State Functions
function showLoadingState() {
  const loadingOverlay = document.getElementById("loading-overlay")
  loadingOverlay.classList.add("active")
}

function hideLoadingState() {
  const loadingOverlay = document.getElementById("loading-overlay")
  loadingOverlay.classList.remove("active")
}

// Chart Drawing Functions
function drawLineChart() {
  const canvas = document.getElementById("lineChart")
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  // Set canvas size for high DPI displays
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  const width = rect.width
  const height = rect.height

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Chart dimensions
  const padding = 60
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  // Data processing
  const data = chartData.subscribers
  const maxValue = Math.max(...data.map((d) => d.subscribers))
  const minValue = Math.min(...data.map((d) => d.subscribers))
  const range = maxValue - minValue

  // Draw grid
  ctx.strokeStyle = "#f0f0f0"
  ctx.lineWidth = 1

  // Vertical grid lines
  for (let i = 0; i <= data.length - 1; i++) {
    const x = padding + (i * chartWidth) / (data.length - 1)
    ctx.beginPath()
    ctx.moveTo(x, padding)
    ctx.lineTo(x, height - padding)
    ctx.stroke()
  }

  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding + (i * chartHeight) / 5
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // Draw axes
  ctx.strokeStyle = "#666"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()

  // Draw Y-axis labels
  ctx.fillStyle = "#666"
  ctx.font = "12px sans-serif"
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"
  for (let i = 0; i <= 5; i++) {
    const value = minValue + (range * (5 - i)) / 5
    const y = padding + (i * chartHeight) / 5
    ctx.fillText(Math.round(value / 1000) + "K", padding - 10, y)
  }

  // Draw X-axis labels
  ctx.textAlign = "center"
  ctx.textBaseline = "top"
  data.forEach((point, index) => {
    const x = padding + (index * chartWidth) / (data.length - 1)
    ctx.fillText(point.month, x, height - padding + 10)
  })

  // Draw line with gradient
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
  gradient.addColorStop(0, "#dc2626")
  gradient.addColorStop(1, "#b91c1c")

  ctx.strokeStyle = gradient
  ctx.lineWidth = 3
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.beginPath()

  const points = []
  data.forEach((point, index) => {
    const x = padding + (index * chartWidth) / (data.length - 1)
    const y = height - padding - ((point.subscribers - minValue) / range) * chartHeight
    points.push({ x, y, data: point })

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  // Draw data points with hover effect
  ctx.fillStyle = "#dc2626"
  points.forEach((point) => {
    ctx.beginPath()
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
    ctx.fill()

    // White border
    ctx.strokeStyle = "white"
    ctx.lineWidth = 2
    ctx.stroke()
  })

  // Add hover functionality
  addChartHover(canvas, points, "lineChartTooltip")
}

function drawBarChart() {
  const canvas = document.getElementById("barChart")
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  // Set canvas size for high DPI displays
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  const width = rect.width
  const height = rect.height

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Chart dimensions
  const padding = 60
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  // Data processing
  const data = chartData.videos
  const maxValue = Math.max(...data.map((d) => d.views))
  const barWidth = chartWidth / (data.length * 2)
  const barSpacing = barWidth

  // Draw grid
  ctx.strokeStyle = "#f0f0f0"
  ctx.lineWidth = 1

  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding + (i * chartHeight) / 5
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // Draw axes
  ctx.strokeStyle = "#666"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()

  // Draw Y-axis labels
  ctx.fillStyle = "#666"
  ctx.font = "12px sans-serif"
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"
  for (let i = 0; i <= 5; i++) {
    const value = (maxValue * (5 - i)) / 5
    const y = padding + (i * chartHeight) / 5
    ctx.fillText(Math.round(value / 1000) + "K", padding - 10, y)
  }

  // Draw bars with gradient
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
  gradient.addColorStop(0, "#3b82f6")
  gradient.addColorStop(1, "#1d4ed8")

  const bars = []
  data.forEach((item, index) => {
    const barHeight = (item.views / maxValue) * chartHeight
    const x = padding + barSpacing + index * (barWidth + barSpacing)
    const y = height - padding - barHeight

    bars.push({ x, y, width: barWidth, height: barHeight, data: item })

    // Draw rounded rectangle
    ctx.fillStyle = gradient
    const radius = 4
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + barWidth - radius, y)
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
    ctx.lineTo(x + barWidth, y + barHeight)
    ctx.lineTo(x, y + barHeight)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.fill()

    // Draw label
    ctx.fillStyle = "#666"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    const label = item.title.length > 12 ? item.title.substring(0, 12) + "..." : item.title
    ctx.fillText(label, x + barWidth / 2, height - padding + 10)
  })

  // Add hover functionality
  addChartHover(canvas, bars, "barChartTooltip", true)
}

// Chart Hover Functionality
function addChartHover(canvas, elements, tooltipId, isBarChart = false) {
  const tooltip = document.getElementById(tooltipId)
  if (!tooltip) return

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let hoveredElement = null

    if (isBarChart) {
      // Check if mouse is over a bar
      hoveredElement = elements.find(
        (bar) => x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height,
      )
    } else {
      // Check if mouse is near a point (within 10px radius)
      hoveredElement = elements.find((point) => {
        const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2))
        return distance <= 10
      })
    }

    if (hoveredElement) {
      const data = hoveredElement.data
      let content = ""

      if (isBarChart) {
        content = `${data.title}<br>Views: ${data.views.toLocaleString()}<br>Likes: ${data.likes.toLocaleString()}`
      } else {
        content = `${data.month}<br>Subscribers: ${data.subscribers.toLocaleString()}`
      }

      tooltip.innerHTML = content
      tooltip.style.left = e.clientX + 10 + "px"
      tooltip.style.top = e.clientY - 10 + "px"
      tooltip.classList.add("visible")
      canvas.style.cursor = "pointer"
    } else {
      tooltip.classList.remove("visible")
      canvas.style.cursor = "default"
    }
  })

  canvas.addEventListener("mouseleave", () => {
    tooltip.classList.remove("visible")
    canvas.style.cursor = "default"
  })
}

// Initialize Charts
function initializeChartsWithErrorHandling() {
  requestAnimationFrame(() => {
    safeChartRender(drawLineChart, "line")
    safeChartRender(drawBarChart, "bar")
  })
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, current page:", currentPage)

  // Ensure home page is active by default
  document.querySelectorAll(".page").forEach((p) => {
    p.classList.remove("active")
  })
  document.getElementById("home-page").classList.add("active")

  updateNavigation()

  // Test if all pages exist
  const pages = ["home", "dashboard", "insights"]
  pages.forEach((page) => {
    const element = document.getElementById(page + "-page")
    console.log(`Page ${page}:`, element ? "found" : "NOT FOUND")
  })

  // Initialize charts if dashboard is visible
  if (currentPage === "dashboard") {
    setTimeout(initializeChartsWithErrorHandling, 100)
  }

  // Close mobile menu when clicking outside
  const mobileMenu = document.getElementById("mobile-menu")
  if (mobileMenu) {
    mobileMenu.addEventListener("click", (e) => {
      if (e.target.id === "mobile-menu") {
        toggleMobileMenu()
      }
    })
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMobileMenuOpen) {
      toggleMobileMenu()
    }

    // Arrow key navigation
    if (e.altKey) {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          if (currentPage === "dashboard") navigateTo("home")
          else if (currentPage === "insights") navigateTo("dashboard")
          break
        case "ArrowRight":
          e.preventDefault()
          if (currentPage === "home") navigateTo("dashboard")
          else if (currentPage === "dashboard") navigateTo("insights")
          break
      }
    }
  })

  // Add loading animation to page elements
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe elements for animation
  document.querySelectorAll(".feature-card, .metric-card, .chart-card, .insight-card").forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(20px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(el)
  })
})

// Handle window resize
window.addEventListener("resize", () => {
  if (currentPage === "dashboard") {
    setTimeout(initializeChartsWithErrorHandling, 100)
  }

  // Close mobile menu on resize to desktop
  if (window.innerWidth >= 768 && isMobileMenuOpen) {
    toggleMobileMenu()
  }
})

// Smooth scroll for anchor links
document.addEventListener("click", (e) => {
  if (e.target.tagName === "A" && e.target.getAttribute("href")?.startsWith("#")) {
    e.preventDefault()
    const target = document.querySelector(e.target.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }
})

// Performance optimization: Debounce resize events
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const debouncedResize = debounce(() => {
  if (currentPage === "dashboard") {
    initializeChartsWithErrorHandling()
  }
}, 250)

window.addEventListener("resize", debouncedResize)

// Add touch support for mobile devices
let touchStartX = 0
let touchStartY = 0

document.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
})

document.addEventListener("touchend", (e) => {
  if (!touchStartX || !touchStartY) return

  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY

  const diffX = touchStartX - touchEndX
  const diffY = touchStartY - touchEndY

  // Only handle horizontal swipes
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
    if (diffX > 0) {
      // Swipe left - next page
      if (currentPage === "home") navigateTo("dashboard")
      else if (currentPage === "dashboard") navigateTo("insights")
    } else {
      // Swipe right - previous page
      if (currentPage === "insights") navigateTo("dashboard")
      else if (currentPage === "dashboard") navigateTo("home")
    }
  }

  touchStartX = 0
  touchStartY = 0
})

// Add error handling for chart rendering
function safeChartRender(chartFunction, chartName) {
  try {
    chartFunction()
  } catch (error) {
    console.error(`Error rendering ${chartName}:`, error)
    // Show fallback content or error message
    const canvas = document.getElementById(chartName === "line" ? "lineChart" : "barChart")
    if (canvas) {
      const ctx = canvas.getContext("2d")
      ctx.fillStyle = "#f3f4f6"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#6b7280"
      ctx.font = "16px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Chart unavailable", canvas.width / 2, canvas.height / 2)
    }
  }
}

// Add print support
window.addEventListener("beforeprint", () => {
  // Ensure all pages are visible for printing
  document.querySelectorAll(".page").forEach((page) => {
    page.style.display = "block"
  })
})

window.addEventListener("afterprint", () => {
  // Restore normal page visibility
  document.querySelectorAll(".page").forEach((page) => {
    page.style.display = "none"
  })
  document.getElementById(currentPage + "-page").style.display = "block"
})

// Add service worker registration for offline support (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
}