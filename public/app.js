class PostsApp {
    constructor() {
        this.allPosts = [];
        this.filteredPosts = [];
        this.currentSearchTerm = '';
        this.minViews = 0;
        this.maxViews = 10000;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadAllPosts();
    }

    initializeElements() {
        // Search elements
        this.searchInput = document.getElementById('searchInput');
        this.suggestionsContainer = document.getElementById('suggestions');
        
        // Filter elements
        this.minViewsSlider = document.getElementById('minViews');
        this.maxViewsSlider = document.getElementById('maxViews');
        this.minViewsValue = document.getElementById('minViewsValue');
        this.maxViewsValue = document.getElementById('maxViewsValue');
        this.applyFilterBtn = document.getElementById('applyFilter');
        this.clearFilterBtn = document.getElementById('clearFilter');
        
        // Results elements
        this.postsContainer = document.getElementById('postsContainer');
        this.resultCount = document.getElementById('resultCount');
        this.loadAllBtn = document.getElementById('loadAll');
    }

    attachEventListeners() {
        // Search functionality
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.trim()) {
                this.showSuggestions();
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSuggestions();
            }
        });

        // Slider functionality
        this.minViewsSlider.addEventListener('input', (e) => {
            this.minViews = parseInt(e.target.value);
            this.minViewsValue.textContent = this.minViews;
            
            // Ensure min doesn't exceed max
            if (this.minViews > this.maxViews) {
                this.maxViews = this.minViews;
                this.maxViewsSlider.value = this.maxViews;
                this.maxViewsValue.textContent = this.maxViews;
            }
        });

        this.maxViewsSlider.addEventListener('input', (e) => {
            this.maxViews = parseInt(e.target.value);
            this.maxViewsValue.textContent = this.maxViews;
            
            // Ensure max doesn't go below min
            if (this.maxViews < this.minViews) {
                this.minViews = this.maxViews;
                this.minViewsSlider.value = this.minViews;
                this.minViewsValue.textContent = this.minViews;
            }
        });

        // Button functionality
        this.applyFilterBtn.addEventListener('click', () => {
            this.applyFilters();
        });

        this.clearFilterBtn.addEventListener('click', () => {
            this.clearFilters();
        });

        this.loadAllBtn.addEventListener('click', () => {
            this.loadAllPosts();
        });
    }

    async fetchPosts(queryParams = '') {
        try {
            const response = await fetch(`/posts${queryParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching posts:', error);
            this.showError('Failed to fetch posts. Please try again.');
            return [];
        }
    }

    async loadAllPosts() {
        this.showLoading();
        this.allPosts = await this.fetchPosts();
        this.filteredPosts = [...this.allPosts];
        this.updateViewsSliderRange();
        this.displayPosts(this.filteredPosts);
        this.updateResultCount(this.filteredPosts.length);
    }

    updateViewsSliderRange() {
        if (this.allPosts.length === 0) return;
        
        const views = this.allPosts.map(post => post.views);
        const minViewsInData = Math.min(...views);
        const maxViewsInData = Math.max(...views);
        
        // Update slider ranges
        this.minViewsSlider.min = minViewsInData;
        this.minViewsSlider.max = maxViewsInData;
        this.maxViewsSlider.min = minViewsInData;
        this.maxViewsSlider.max = maxViewsInData;
        
        // Set initial values
        this.minViews = minViewsInData;
        this.maxViews = maxViewsInData;
        this.minViewsSlider.value = this.minViews;
        this.maxViewsSlider.value = this.maxViews;
        this.minViewsValue.textContent = this.minViews;
        this.maxViewsValue.textContent = this.maxViews;
    }

    handleSearchInput(searchTerm) {
        this.currentSearchTerm = searchTerm.trim();
        
        if (this.currentSearchTerm.length === 0) {
            this.hideSuggestions();
            this.filteredPosts = [...this.allPosts];
            this.displayPosts(this.filteredPosts);
            this.updateResultCount(this.filteredPosts.length);
            return;
        }

        if (this.currentSearchTerm.length >= 1) {
            this.showSuggestions();
            this.performSearch();
        }
    }

    showSuggestions() {
        if (this.currentSearchTerm.length === 0) return;
        
        const suggestions = this.getSuggestions(this.currentSearchTerm);
        this.renderSuggestions(suggestions);
        this.suggestionsContainer.style.display = 'block';
    }

    hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
    }

    getSuggestions(searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchingTitles = this.allPosts
            .filter(post => post.title.toLowerCase().includes(term))
            .map(post => post.title)
            .filter((title, index, arr) => arr.indexOf(title) === index) // Remove duplicates
            .slice(0, 5); // Limit to 5 suggestions
        
        return matchingTitles;
    }

    renderSuggestions(suggestions) {
        this.suggestionsContainer.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-item';
            suggestionElement.textContent = suggestion;
            
            suggestionElement.addEventListener('click', () => {
                this.searchInput.value = suggestion;
                this.currentSearchTerm = suggestion;
                this.hideSuggestions();
                this.performSearch();
            });
            
            this.suggestionsContainer.appendChild(suggestionElement);
        });
    }

    performSearch() {
        if (this.currentSearchTerm.length === 0) {
            this.filteredPosts = [...this.allPosts];
        } else {
            this.filteredPosts = this.allPosts.filter(post => 
                post.title.toLowerCase().includes(this.currentSearchTerm.toLowerCase())
            );
        }
        
        this.displayPosts(this.filteredPosts);
        this.updateResultCount(this.filteredPosts.length);
    }

    async applyFilters() {
        this.showLoading();
        
        let queryParams = `?views_gte=${this.minViews}&views_lte=${this.maxViews}`;
        
        if (this.currentSearchTerm) {
            queryParams += `&title_like=${encodeURIComponent(this.currentSearchTerm)}`;
        }
        
        const filteredPosts = await this.fetchPosts(queryParams);
        this.filteredPosts = filteredPosts;
        this.displayPosts(this.filteredPosts);
        this.updateResultCount(this.filteredPosts.length);
    }

    clearFilters() {
        // Reset search
        this.searchInput.value = '';
        this.currentSearchTerm = '';
        this.hideSuggestions();
        
        // Reset sliders to data range
        this.updateViewsSliderRange();
        
        // Show all posts
        this.filteredPosts = [...this.allPosts];
        this.displayPosts(this.filteredPosts);
        this.updateResultCount(this.filteredPosts.length);
    }

    displayPosts(posts) {
        if (posts.length === 0) {
            this.postsContainer.innerHTML = '<div class="no-results">No posts found matching your criteria.</div>';
            return;
        }

        const postsHTML = posts.map(post => `
            <div class="post-card" onclick="app.viewPost('${post.id}')">
                <div class="post-title">${this.escapeHtml(post.title)}</div>
                <div class="post-meta">
                    <span class="post-id">ID: ${post.id}</span>
                    <span class="post-views">${post.views.toLocaleString()} views</span>
                </div>
            </div>
        `).join('');

        this.postsContainer.innerHTML = postsHTML;
    }

    async viewPost(postId) {
        try {
            const response = await fetch(`/posts/${postId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const post = await response.json();
            
            alert(`Post Details:\n\nTitle: ${post.title}\nID: ${post.id}\nViews: ${post.views.toLocaleString()}`);
        } catch (error) {
            console.error('Error fetching post details:', error);
            alert('Failed to load post details.');
        }
    }

    showLoading() {
        this.postsContainer.innerHTML = '<div class="loading">Loading posts...</div>';
    }

    showError(message) {
        this.postsContainer.innerHTML = `<div class="error">${this.escapeHtml(message)}</div>`;
    }

    updateResultCount(count) {
        this.resultCount.textContent = count;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PostsApp();
});

// Add some keyboard navigation for suggestions
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('searchInput').blur();
        document.getElementById('suggestions').style.display = 'none';
    }
});