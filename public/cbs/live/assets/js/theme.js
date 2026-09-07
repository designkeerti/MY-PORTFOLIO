/* CBS-QA-FIX m2-slick-shim: slick.js dequeued by CBS-PERF-07; no-op prevents "$slider.slick is not a function" (0-element legacy carousels). */
window.jQuery && jQuery.fn && !jQuery.fn.slick && (jQuery.fn.slick=function(){return this;});
/* CBS-PHOSPHOR-INJECT */
(function(){
  var variants = ["fill","regular","duotone"];
  variants.forEach(function(v){
    var href = "https://unpkg.com/@phosphor-icons/web@2.1.1/src/"+v+"/style.css";
    if (!document.querySelector("link[href=\""+href+"\"]")) {
      var l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l);
    }
  });
})();
/* END CBS-PHOSPHOR-INJECT */
jQuery(document).ready(function(){
	
	jQuery('button.wc-block-cart-item__remove-link').html('<i class="ph-bold ph-trash" aria-hidden="true"></i>');
	
	
	 // Function to check Hostinger Reach newsletter checkbox
	function checkNewsletter() {
		jQuery('#order-cusrev-checkout-consent').prop('checked', true);
	}
	
	 // Check after checkout updates
	jQuery(document.body).on('updated_checkout', function() {
		checkNewsletter();
	});
	
	// Check on initial load
	checkNewsletter();
	
	
	var findInsiders = function(elem) {
    
    var tabbable = elem.find('select, input, textarea, button, a').filter(':visible');
    
    var firstTabbable = tabbable.first();
    var lastTabbable = tabbable.last();
    /*set focus on first input*/
    firstTabbable.focus();

    /*redirect last tab to first input*/
    lastTabbable.on('keydown', function (e) {
       if ((e.which === 9 && !e.shiftKey)) {
           e.preventDefault();
           firstTabbable.focus();
       }
    });

    /*redirect first shift+tab to last input*/
    firstTabbable.on('keydown', function (e) {
        if ((e.which === 9 && e.shiftKey)) {
            e.preventDefault();
            lastTabbable.focus();
        }
    });
    
  };
  
  jQuery('a.button.product_type_simple').text('Add to cart');
  
	var pencilIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_1208_3822)"><path d="M9 20.2501H4.5C4.30109 20.2501 4.11032 20.1711 3.96967 20.0305C3.82902 19.8898 3.75 19.699 3.75 19.5001V15.3104C3.75009 15.1118 3.82899 14.9213 3.96938 14.7807L15.5306 3.2195C15.6713 3.07895 15.862 3 16.0608 3C16.2596 3 16.4503 3.07895 16.5909 3.2195L20.7806 7.40637C20.9212 7.54701 21.0001 7.7377 21.0001 7.93653C21.0001 8.13535 20.9212 8.32605 20.7806 8.46668L9 20.2501Z" stroke="#05171F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.25 20.25H9" stroke="#05171F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.75 6L18 11.25" stroke="#05171F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_1208_3822"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>';

	jQuery("#comments").before("<div class='write-review'><span>" + pencilIcon + " Write a review</span></div>");
	
	jQuery(".search-results #primary, .search-results #sidebar1").wrapAll('<div class="main-search-box"></div>');
	
	jQuery(".woocommerce-shop #primary, .woocommerce-shop #sidebar1").wrapAll('<div class="main-search-box"></div>');
	
	jQuery(".tax-product_brand #primary, .tax-product_brand #sidebar1").wrapAll('<div class="main-search-box"></div>');
	
	var filterIcon = '<svg width="64px" height="64px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M0 3H16V1H0V3Z" fill="#1f92bf"></path> <path d="M2 7H14V5H2V7Z" fill="#1f92bf"></path> <path d="M4 11H12V9H4V11Z" fill="#1f92bf"></path> <path d="M10 15H6V13H10V15Z" fill="#1f92bf"></path> </g></svg>';
	
	jQuery(".woocommerce-result-count").before("<div class='filter-btn'><span>" + filterIcon + "</span></div>");
	
	jQuery('.filter-btn').on('click', function(e) {
        e.preventDefault(); // Prevent default action if it's a link/button
        
        // Trigger click on the product filters overlay
        jQuery('.wc-block-product-filters__open-overlay').trigger('click');
        jQuery('body').addClass('active-sidebar');
        
    });
	
	   
	jQuery('.shop-sidebar aside').before('<span class="close-sidebar">X</span>');
	jQuery('.shop-sidebar aside').after('<span class="Apply-flter">Apply Filter</span>');
	
	jQuery('#sidebar1').prepend('<span class="close-sidebar">X</span>');
	jQuery('#sidebar1').append('<span class="Apply-flter">Apply Filter</span>');
	
	jQuery('p.comment-form-author label').append('<span class="required"> *</span>');
	jQuery('p.comment-form-email label').append('<span class="required"> *</span>');
	
	jQuery('.Apply-flter, .close-sidebar').on('click', function(e) {
		jQuery('body').addClass('remove-overflow');
        jQuery('body').removeClass('active-sidebar');        
    });

	// Add click event to scroll to #review_form
	jQuery(document).on('click', '.write-review span', function(e) {
		e.preventDefault();
		
		// Check if the review form exists
		if (jQuery('#review_form').length) {
			// Smooth scroll to the review form
			jQuery('html, body').animate({
				scrollTop: jQuery('#review_form').offset().top - 100 // Adjust offset as needed
			}, 500);
		}
	});
  
  /**** Search popup ****/
  
  jQuery(document).on('click','.search-icon',function(){
	  
	findInsiders(jQuery('.niceblog-search-form'));
	setTimeout(function(){ 
		jQuery(".close_search").focus();
	}, 200);
	  jQuery('body').addClass('show-search');
  });
  
  jQuery(document).on('click','.close_search',function(){
	  jQuery('body').removeClass('show-search');
  });
  
  
  /**** filter ****/
  
  jQuery(document).on('click','.filter-box',function(){
	  jQuery('body').addClass('filterActive');
  });
  
  jQuery(document).on('click','.close-btn',function(){
	  jQuery('body').removeClass('filterActive');
  });
  
  /*** mobile search ***/
  jQuery(document).on('click','.search-icon-m',function(){
	  jQuery('body').addClass('searchActive');
  });
  
  jQuery(document).on('click','.close_search',function(){
	  jQuery('body').removeClass('searchActive');
  });
  
  
  /******** menu *****/
  
	jQuery('.main-navigation ul#primary-menu').before('<button class="close-menu">X</button>');
	jQuery('div#primary-menu').prepend('<button class="close-menu">X</button>');
	jQuery('.main-navigation li.menu-item-type-post_type.menu-item-has-children').prepend('<i class="fa fa-angle-down"></i>');
	
	jQuery(document).on('click','.main-navigation .menu .close-menu',function(){
	  jQuery('.main-navigation').removeClass('toggled');
	  jQuery(".menu-toggle").focus();
	});
  
	jQuery(document).on('click','.menu-toggle',function(){
		findInsiders(jQuery('.main-navigation .menu'));
		
		setTimeout(function(){ 
			jQuery('.main-navigation .menu .close-menu').focus();
		}, 200);
	
	});
  
  
	jQuery('.search-box form.search-form input').attr('placeholder', 'Search for Products, Categories, Stacks');
	
	jQuery('.woocommerce a.remove').html('<i class="ph-bold ph-trash" aria-hidden="true"></i>');
	
	jQuery('.woocommerce.single-product div.product form.cart div.quantity label.screen-reader-text').text('Quantity');
	
	jQuery('li.shop-sub-menu a').append('<svg width="25" height="24" viewBox="0 0 25 24" fill="none"><path d="M20 9.25L12.5 16.75L5 9.25" stroke="white" stroke-width="3" stroke-linecap="round"/></svg>');
	
	jQuery(document).on('click', '.clck-click', function(e){
		e.stopPropagation();
		var $parent = jQuery(this).parent();
		$parent.toggleClass('effectOn');
	});
	
	jQuery(document).on('click', '.rdMore', function(){
		jQuery('.thleat-box-main').toggleClass('showTxt');
		
		// Check the current text of the clicked element to determine what to set for ALL
		if (jQuery(this).text().trim() === "Read More") {
			jQuery('.rdMore').text("Read Less");
		} else {
			jQuery('.rdMore').text("Read More");
		}
	});
		
	jQuery('.woocommerce ul.products li.product a img').wrap('<div class="image-box"></div>');

	jQuery(document).on('click', function(e){
		// Remove class from all elements with effectOn when clicking outside
		jQuery('.effectOn').removeClass('effectOn');
	});
	// Store original slides count
	var originalSlidesCount = jQuery('.slider-item').length;
	
	// Initialize the slider
	var $slider = jQuery('.slider');
	
	$slider.slick({
		dots: false, // Disable default dots
		arrows: true,
		infinite: false,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 3000,
		pauseOnHover: true
	});
	
	// Add click event to static dots
	jQuery('#customDots').on('click', '.custom-dot', function() {
		var slideIndex = jQuery(this).data('slide');
		console.log('Clicked dot for slide:', slideIndex);
		$slider.slick('slickGoTo', slideIndex);
		updateActiveDot(slideIndex);
	});
	
	// Update active dot when slider changes
	$slider.on('afterChange', function(event, slick, currentSlide) {
		console.log('Slider changed to:', currentSlide);
		// Convert slick's currentSlide to our original index
		var originalIndex = currentSlide % originalSlidesCount;
		console.log('Original index:', originalIndex);
		updateActiveDot(originalIndex);
	});
	
	// Update active dot
	function updateActiveDot(index) {
		console.log('Updating active dot to:', index);
		jQuery('#customDots .custom-dot').removeClass('active');
		jQuery('#customDots .custom-dot[data-slide="' + index + '"]').addClass('active');
	}
	
	/**** product slider ****/
	
	// Alternative: Make both sliders reinitialize on resize
	function initializeSliderWithResize($slider) {
		if (!$slider.length) return;
		
		function initSlider() {
			if ($slider.hasClass('slick-initialized')) {
				$slider.slick('unslick');
			}
			
			var windowWidth = jQuery(window).width();
			var slidesToShow = 5;
			
			if (windowWidth <= 599) slidesToShow = 1;
			else if (windowWidth <= 768) slidesToShow = 3;
			else if (windowWidth <= 991) slidesToShow = 4;
			
			$slider.slick({
				dots: true,
				arrows: true,
				infinite: true,
				speed: 500,
				slidesToShow: slidesToShow,
				slidesToScroll: 1,
				autoplay: true,
				autoplaySpeed: 5000,
				pauseOnHover: true,
				responsive: [
					{ breakpoint: 991, settings: { slidesToShow: 4, slidesToScroll: 1 } },
					{ breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 1 } },
					{ breakpoint: 599, settings: { slidesToShow: 1, slidesToScroll: 1, arrows: true } }
				]
			});
		}
		
		initSlider();
		
		var resizeTimer;
		jQuery(window).on('resize', function() {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(initSlider, 250);
		});
	}

	// Initialize both sliders
	initializeSliderWithResize(jQuery('.pro-slider1'));
	initializeSliderWithResize(jQuery('.pro-slider2'));
	
	
	// Initialize the slider
	var $gallerySlider = jQuery('.gallery-slider-pr');
	
	$gallerySlider.slick({
		dots: true, // Disable default dots
		arrows: true,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 50000,
		pauseOnHover: true
	});	
	
	var $mobileins = jQuery('.mobile-view-ins');

	jQuery(window).on('resize', function() {
	  const $insfeed = jQuery('.thleat-box-main');
	  const windowWidth = jQuery(window).width();
	  
	  if (windowWidth <= 599) {
		// Add class if not already added
		if (!$insfeed.hasClass('mobile-view-ins')) {
		  $insfeed.addClass('mobile-view-ins');
		}
		
		jQuery('.shop-brands').addClass('mobile-logo');
		
		// Initialize the slider
		var $logoSlider = jQuery('.mobile-logo');
		
		$logoSlider.slick({
			dots: false, // Disable default dots
			arrows: false,
			infinite: true,
			speed: 500,
			slidesToShow: 3,
			slidesToScroll: 1,
			autoplay: true,
			centerMode: true,
			autoplaySpeed: 2000,
			pauseOnHover: true
		});
		
		// Check if slick is already initialized
		if (!$insfeed.hasClass('slick-initialized')) {
		  $insfeed.slick({
			dots: false,
			arrows: true,
			infinite: false,
			speed: 500,
			slidesToShow: 1,
			slidesToScroll: 1,
			autoplay: true,
			autoplaySpeed: 5000,
			pauseOnHover: true
		  });
		}
	  } else {
		  jQuery('.shop-brands').removeClass('mobile-logo');
		// Remove class and destroy slick
		if ($insfeed.hasClass('mobile-view-ins')) {
		  $insfeed.removeClass('mobile-view-ins');
		  if ($insfeed.hasClass('slick-initialized')) {
			$insfeed.slick('unslick');
		  }
		}
	  }
	}).trigger('resize'); // Run on initial load
	
	// Main function to handle all radio groups
	function initRadioGroups() {
		// Find all radio groups on the page
		var radioGroups = {};
		
		jQuery('input[type="radio"]').each(function() {
			var groupName = jQuery(this).attr('name');
			if (groupName && !radioGroups[groupName]) {
				radioGroups[groupName] = true;
				
				// Initialize this group
				updateRadioGroup(groupName);
				
				// Set up change event for this group
				jQuery('input[name="' + groupName + '"]').on('change', function() {
					updateRadioGroup(groupName);
				});
			}
		});
	}

	// Update a specific radio group
	function updateRadioGroup(groupName) {
		// Remove active class only from items in this specific group
		jQuery('input[name="' + groupName + '"]').closest('.wpcf7-list-item').removeClass('active');
		
		// Add active class to checked item
		var $checkedRadio = jQuery('input[name="' + groupName + '"]:checked');
		if ($checkedRadio.length > 0) {
			$checkedRadio.closest('.wpcf7-list-item').addClass('active');
		}
	}

	// Main function to handle all checkboxes
	function initCheckboxGroups() {
		// Find all checkboxes on the page
		jQuery('input[type="checkbox"]').each(function() {
			var checkboxName = jQuery(this).attr('name');
			
			// Initialize this checkbox
			updateCheckboxState(this);
			
			// Set up change event for this checkbox
			jQuery(this).on('change', function() {
				updateCheckboxState(this);
			});
		});
	}

	// Update a specific checkbox state
	function updateCheckboxState(checkbox) {
		var $checkbox = jQuery(checkbox);
		var $listItem = $checkbox.closest('.wpcf7-list-item');
		
		if ($checkbox.is(':checked')) {
			$listItem.addClass('active');
		} else {
			$listItem.removeClass('active');
		}
	}

	initRadioGroups();
	initCheckboxGroups();
	
	
	// Fix pagination click events
	jQuery(document).ready(function($) {
		// Remove any event handlers that might be blocking clicks
		$(document).off('click', '.page-numbers a');
		
		// Re-enable default link behavior
		$(document).on('click', '.page-numbers a', function(e) {
			// Allow the link to work normally
			return true;
		});
		
		// Alternative: Force page reload
		$(document).on('click', '.page-numbers a:not(.current)', function(e) {
			window.location = $(this).attr('href');
			return false;
		});
	});
	
  
});


var findInsiders = function(elem) {
    
    var tabbable = elem.find('select, input, textarea, button, a').filter(':visible');
    
    var firstTabbable = tabbable.first();
    var lastTabbable = tabbable.last();
    /*set focus on first input*/
    firstTabbable.focus();
	
	 findInsiders(jQuery('.niceblog-main-nav'));

    /*redirect last tab to first input*/
    lastTabbable.on('keydown', function (e) {
       if ((e.which === 9 && !e.shiftKey)) {
           e.preventDefault();
           firstTabbable.focus();
       }
    });

    /*redirect first shift+tab to last input*/
    firstTabbable.on('keydown', function (e) {
        if ((e.which === 9 && e.shiftKey)) {
            e.preventDefault();
            lastTabbable.focus();
        }
    });
    
    /* allow escape key to close insiders div */
    elem.on('keyup', function(e){
      if (e.keyCode === 27 ) {
        elem.hide();
      };
    });
  };


// 1. Toggle the Main Drawer (Slide in/out)
function toggleMain() {
	document.getElementById('mobileNav').classList.toggle('is-open');
	document.querySelector('.toggle-menu-mobile').classList.toggle('active');
}

// 2. Generic Accordion Toggle (Works for both Shop and Inner Columns)
function toggleAccordion(e, id) {
	e.preventDefault();
	
	// Toggle the '+' icon rotation
	e.currentTarget.classList.toggle('active');

	// Toggle the height of the target submenu
	const content = document.getElementById(id);
	if (content.style.maxHeight) {
		content.style.maxHeight = null;
	} else {
		content.style.maxHeight = content.scrollHeight + "px";
	}

	// Optional: If opening a deep-submenu, expand the parent wrapper too
	// This ensures the parent container grows to fit the new inner content
	const parent = content.parentElement.closest('.submenu');
	if (parent && parent.style.maxHeight) {
		parent.style.maxHeight = "none"; // Remove restriction so it can grow
	}
}


// JavaScript to hide the preloader after the page loads
window.addEventListener("load", function () {
  const preloader = (document.getElementById("preloader")||document.createElement("div"));
  setTimeout(function() {
    preloader.style.display = "none";
  }, 1200); // 2000 milliseconds = 2 seconds
});





/***  jquery animation ***/

jQuery(function($) {
  
  // Function which adds the 'animated' class to any '.animatable' in view
  var doAnimations = function() {
    
    // Calc current offset and get all animatables
    var offset = $(window).scrollTop() + $(window).height(),
        $animatables = $('.animatable');
    
    // Unbind scroll handler if we have no animatables
    if ($animatables.length == 0) {
      $(window).off('scroll', doAnimations);
    }
    
    // Check all animatables and animate them if necessary
		$animatables.each(function(i) {
       var $animatable = $(this);
			if (($animatable.offset().top + $animatable.height() - 20) < offset) {
        $animatable.removeClass('animatable').addClass('animated');
			}
    });

	};
  
  // Hook doAnimations on scroll, and trigger a scroll
	$(window).on('scroll', doAnimations);
  $(window).trigger('scroll');

});


jQuery(document).ready(function($) {
    $('#commentform').on('submit', function(e) {
        let isValid = true;
        let errorMessage = '';
        
        // Get field values
        const name = $('#author').val().trim();
        const email = $('#email').val().trim();
        
        // Validate name
        if (name === '') {
            isValid = false;
            errorMessage += 'Name is required.\n';
            $('#author').css('border', '1px solid red');
        } else {
            $('#author').css('border', '');
        }
        
        // Validate email
        if (email === '') {
            isValid = false;
            errorMessage += 'Email is required.\n';
            $('#email').css('border', '1px solid red');
        } else {
            // Basic email format validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                isValid = false;
                errorMessage += 'Please enter a valid email address.\n';
                $('#email').css('border', '1px solid red');
            } else {
                $('#email').css('border', '');
            }
        }
        
        // If validation fails, show error and prevent submit
        if (!isValid) {
            e.preventDefault();
            alert('Please fix the following errors:\n' + errorMessage);
        }
		
		 //e.preventDefault();
    });
    
    // Remove red border when user starts typing
    $('#author, #email').on('keyup', function() {
        $(this).css('border', '');
    });
});

// =====================================================
// FIX: "Select Options" on wishlist - go to product page
// Safari iOS uses touch events, not click, so YITH's touch
// handler would redirect to /wishlist/view/XXXX/ instead.
// Solution: rewrite the href directly on DOM ready so that
// ANY handler (click, touch, YITH) navigates to the correct
// clean product URL with no wishlist query params.
// =====================================================
function fixWishlistSelectOptionsLinks() {
    jQuery('.woocommerce-wishlist a.product_type_variable.add_to_cart_button').each(function() {
        var href = jQuery(this).attr('href');
        if (href && href.indexOf('?') !== -1) {
            var cleanUrl = href.split('?')[0];
            jQuery(this).attr('href', cleanUrl);
            // Also remove data attributes YITH uses to trigger its own redirect
            jQuery(this).removeAttr('data-product_id');
            jQuery(this).removeClass('ajax_add_to_cart add_to_cart');
        }
    });
}

// Run on initial page load
jQuery(document).ready(function() {
    fixWishlistSelectOptionsLinks();
});

// Also run after YITH reloads the wishlist via AJAX (mobile swap)
jQuery(document).on('yith_wcwl_wishlist_loaded yith_wcwl_added_to_cart', function() {
    fixWishlistSelectOptionsLinks();
});

// Intercept click AND touch for extra safety
jQuery(document).on('click touchend', '.woocommerce-wishlist a.product_type_variable', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var href = jQuery(this).attr('href');
    // href is already clean (no query params) thanks to fixWishlistSelectOptionsLinks()
    // but just in case, strip again
    window.location.href = href.split('?')[0];
});

/* ==========================================================
   CBS — Phosphor Icons + Live Cart/Wishlist Counters
   Injected: 2026-04-25
   ========================================================== */
(function ($) {
  'use strict';

  /* 1. Load Phosphor Icons Bold via CDN */
  function loadPhosphor() {
    if (document.getElementById('cbs-phosphor-css')) return;
    var link = document.createElement('link');
    link.id   = 'cbs-phosphor-css';
    link.rel  = 'stylesheet';
    link.href = 'https://unpkg.com/@phosphor-icons/web@2.1.1/src/bold/style.css';
    document.head.appendChild(link);
  }
  loadPhosphor();

  /* 2. Icon swap rules */
  var ICON_MAP = [
    { sel: 'a.search-icon-m svg',        ph: 'ph-bold ph-magnifying-glass', sz: '26px' },
    { sel: 'a.wish-list > svg',           ph: 'ph-bold ph-heart',            sz: '26px' },
    { sel: 'a.cart-icon > svg',           ph: 'ph-bold ph-shopping-cart',    sz: '28px' },
    { sel: 'a.user-login svg',            ph: 'ph-bold ph-user',             sz: '26px' },
    { sel: '.toggle-menu-mobile svg',     ph: 'ph-bold ph-list',             sz: '28px' },
    { sel: '.clck-click svg',             ph: 'ph-bold ph-cursor-click',     sz: '22px' },
    { sel: '.yith-wcwl-add-button svg, .wishlist-container svg', ph: 'ph-bold ph-heart', sz: '20px' },
    { sel: 'button.search-submit svg',    ph: 'ph-bold ph-magnifying-glass', sz: '18px' }
  ];

  function swapIcons() {
    ICON_MAP.forEach(function(rule) {
      document.querySelectorAll(rule.sel).forEach(function(svg) {
        if (svg.getAttribute('data-ph-done')) return;
        var i = document.createElement('i');
        i.className = rule.ph;
        i.style.cssText = 'font-size:'+rule.sz+';display:inline-flex;align-items:center;line-height:1;';
        svg.parentNode.replaceChild(i, svg);
      });
    });
    /* Colour active wishlist hearts */
    document.querySelectorAll('.yith-wcwl-add-to-wishlist.exists i.ph-heart').forEach(function(i){
      i.style.color = 'var(--cbs-cyan-100)';
    });
  }

  /* 3. Icon & badge CSS */
  function injectStyles() {
    if (document.getElementById('cbs-ph-styles')) return;
    var s = document.createElement('style');
    s.id = 'cbs-ph-styles';
    s.textContent =
      'a.wish-list i[class*=ph-],a.cart-icon i[class*=ph-],a.user-login i[class*=ph-],a.search-icon-m i[class*=ph-]{color:var(--cbs-cyan-100);transition:color .2s}' +
      '.toggle-menu-mobile i[class*=ph-]{color:#fff}' +
      '.clck-click i[class*=ph-]{color:var(--cbs-cyan-100);font-size:22px!important}' +
      '.yith-wcwl-add-to-wishlist i[class*=ph-]{color:#aaa;transition:color .2s}' +
      '.yith-wcwl-add-to-wishlist.exists i[class*=ph-],.yith-wcwl-add-to-wishlist:hover i[class*=ph-]{color:var(--cbs-cyan-100)!important}' +
      /* Badge styles */
      '.wish-list{position:relative;display:inline-flex;align-items:center}' +
      '.wish-list .wl-badge{position:absolute;top:-8px;right:-10px;min-width:18px;height:18px;padding:0 4px;background:var(--cbs-cyan-100);color:#fff;font-size:11px;font-weight:700;border-radius:99px;display:flex;align-items:center;justify-content:center;line-height:1;pointer-events:none}' +
      '.cart-icon{position:relative;display:inline-flex;align-items:center}' +
      '.cart-count{position:absolute;top:-8px;right:-10px;min-width:18px;height:18px;padding:0 4px;background:var(--cbs-cyan-100);color:#fff;font-size:11px;font-weight:700;border-radius:99px;display:flex;align-items:center;justify-content:center;line-height:1}' +
      '@keyframes cbs-pulse{0%{transform:scale(1)}40%{transform:scale(1.5)}100%{transform:scale(1)}}' +
      '.cbs-badge-pulse{animation:cbs-pulse .4s ease}';
    document.head.appendChild(s);
  }

  /* 4. Badge helpers */
  function pulseEl(el) {
    $(el).addClass('cbs-badge-pulse');
    setTimeout(function(){ $(el).removeClass('cbs-badge-pulse'); }, 500);
  }

  function setCartBadge(n) {
    $('.cart-count').text(n);
    pulseEl('.cart-count');
  }

  function setWishBadge(n) {
    var $b = $('.wish-list .wl-badge');
    if (!$b.length) $('<span class="wl-badge"></span>').appendTo('.wish-list');
    $b = $('.wish-list .wl-badge');
    $b.text(n).toggle(n > 0);
    pulseEl($b);
  }

  /* 5. AJAX refreshers */
  function refreshCart() {
    $.post('/wp-admin/admin-ajax.php', {action:'woocommerce_get_refreshed_fragments'}, function(res) {
      if (res && res.fragments) {
        $.each(res.fragments, function(sel, html) {
          try { $(sel).replaceWith(html); } catch(e){}
        });
      }
      setTimeout(swapIcons, 60);
    });
  }

  function refreshWishlist() {
    $.post('/wp-admin/admin-ajax.php', {action:'yith_wcwl_update_wishlist_count'}, function(res) {
      if (res && res.count != null) setWishBadge(parseInt(res.count, 10));
    });
  }

  /* 6. Event bindings */
  function bindEvents() {
    /* Cart: instant +1, then confirm */
    $(document.body).on('added_to_cart', function() {
      var n = parseInt($('.cart-count').text(), 10) || 0;
      setCartBadge(n + 1);
      setTimeout(refreshCart, 800);
      setTimeout(swapIcons, 80);
    });
    $(document.body).on('removed_from_cart cart_page_refreshed', function() {
      setTimeout(refreshCart, 400);
    });
    /* Wishlist */
    $(document.body).on('yith_wcwl_after_add_to_wishlist', function(e, d) {
      d && d.wishlist_items_count != null ? setWishBadge(d.wishlist_items_count) : setTimeout(refreshWishlist, 600);
      setTimeout(swapIcons, 80);
    });
    $(document.body).on('yith_wcwl_product_removed_from_wishlist', function(e, d) {
      d && d.wishlist_items_count != null ? setWishBadge(d.wishlist_items_count) : setTimeout(refreshWishlist, 600);
    });
    /* Slick: re-swap after slide render */
    $(document).on('init reInit afterChange', '.slick-slider', function() {
      setTimeout(swapIcons, 80);
    });
  }

  /* 7. Boot */
  $(document).ready(function() {
    injectStyles();
    setTimeout(swapIcons, 100);
    bindEvents();
    /* Seed wishlist badge from server-rendered count if present */
    var wlInit = parseInt($('.wishlist_products_counter_number,.yith-wcwl-items-count').first().text(), 10);
    if (wlInit > 0) setWishBadge(wlInit);
  });

})(jQuery);


/* ──────────────────────────────────────────────────────────────────────────
   PRODUCT GALLERY: Thumbnail click → swap main image (no lightbox popup)
   ────────────────────────────────────────────────────────────────────────── */
(function() {
  function initThumbSwap() {
    var thumbStrip = document.querySelector('.thumb-gallery-slider');
    if (!thumbStrip) return;

    var mainImgEl = document.querySelector('.woocommerce-product-gallery__image img');
    if (!mainImgEl) return;

    var thumbDivs = thumbStrip.querySelectorAll('.product-second-image');
    if (!thumbDivs.length) return;

    // Mark first thumb as active on load
    if (thumbDivs[0]) thumbDivs[0].classList.add('active');

    thumbDivs.forEach(function(div, idx) {
      div.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Get the full image URL from the anchor's href
        var anchor = div.querySelector('a');
        var fullSrc = anchor ? anchor.getAttribute('href') : null;
        var thumbSrc = div.querySelector('img') ? div.querySelector('img').getAttribute('src') : null;

        if (mainImgEl && (fullSrc || thumbSrc)) {
          // Swap main image to the full-size version
          var newSrc = fullSrc || thumbSrc;
          mainImgEl.setAttribute('src', newSrc);
          mainImgEl.setAttribute('srcset', '');
          // Also update the anchor around the main image if present
          var mainAnchor = mainImgEl.closest('a');
          if (mainAnchor) mainAnchor.setAttribute('href', newSrc);
        }

        // Update active state
        thumbDivs.forEach(function(d) { d.classList.remove('active'); });
        div.classList.add('active');
      });
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThumbSwap);
  } else {
    initThumbSwap();
  }
  // Also run after a short delay to handle async rendering
  setTimeout(initThumbSwap, 800);
})();


/* =====================================================
   Review Pill -> Reviews Tab Navigation
   Clicking the rating/review pill scrolls to and
   activates the Reviews tab panel.
   ===================================================== */
jQuery(document).ready(function($) {
    // Handle click on the review pill (rating wrapper) or the review link inside it
    $(document).on('click', '.woocommerce-product-rating, .woocommerce-review-link', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Activate the Reviews tab
        var $reviewsTab = $('a[href="#menu2"][data-toggle="tab"]');
        if ($reviewsTab.length) {
            $reviewsTab.tab('show');
        }

        // Scroll smoothly to the tab content area
        var $tabSection = $('.product-detail-content-box, .for-mb');
        if ($tabSection.length) {
            $('html, body').animate({
                scrollTop: $tabSection.offset().top - 80
            }, 500);
        }
    });
});



/* CBS-JS-V2-CLEAN ============================================
   Vanilla interactions: cursor-pill fan-out + price reformat.
   ========================================================== */
(function(){
  "use strict";
  if (window.CBS_JS_V2_LOADED) return;
  window.CBS_JS_V2_LOADED = true;
  function each(list, fn){ Array.prototype.forEach.call(list, fn); }
  function reformatPrice(priceEl){
    if (!priceEl || priceEl.dataset.cbsPriced === "1") return;
    var html = priceEl.innerHTML;
    var out = "";
    for (var i=0; i<html.length; i++) {
      if (html.charCodeAt(i) === 46 && html.charCodeAt(i+1) === 48 && html.charCodeAt(i+2) === 48) {
        var prev = html.charCodeAt(i-1);
        if (prev >= 48 && prev <= 57) { i += 2; continue; }
      }
      out += html.charAt(i);
    }
    var open1 = out.indexOf("<bdi>");
    var close1 = open1 > -1 ? out.indexOf("</bdi>", open1) : -1;
    var open2 = close1 > -1 ? out.indexOf("<bdi>", close1) : -1;
    if (open1 > -1 && close1 > -1 && open2 > -1) {
      var first = out.slice(open1, close1 + 6);
      out = out.slice(0, open1) + '<span class="from-label">From</span>' + first;
    }
    if (out.indexOf("from-label") === -1) {
      var bdiIdx = out.indexOf("<bdi>");
      var fromIdx = out.toLowerCase().indexOf("from");
      if (fromIdx > -1 && bdiIdx > -1 && fromIdx < bdiIdx) {
        var pre = out.slice(0, bdiIdx);
        var preCleaned = "";
        for (var k=0; k<pre.length;) {
          if (pre.substr(k,4).toLowerCase() === "from") { k += 4; continue; }
          preCleaned += pre.charAt(k); k++;
        }
        out = '<span class="from-label">From</span>' + preCleaned + out.slice(bdiIdx);
      }
    }
    priceEl.innerHTML = out;
    priceEl.dataset.cbsPriced = "1";
  }
  function reformatAllPrices(scope){
    var root = scope || document;
    each(root.querySelectorAll(".product .price, .product-price, ul.products .price"), reformatPrice);
  }
  function getCardData(card){
    var d = { stock: card.classList.contains("outofstock") ? "Out of stock" : "In stock", brand: null, attrs: [] };
    var brandMap = ["apollon-nutrition","anarchy-labs","bake-nutrition","beast-pharm","combat-fuel","genius-nutrition","per4m","gasp","better-bodies"];
    for (var b=0; b<brandMap.length; b++) {
      if (card.className.indexOf("product_cat-" + brandMap[b]) > -1) {
        var raw = brandMap[b].split("-");
        for (var w=0; w<raw.length; w++) raw[w] = raw[w].charAt(0).toUpperCase() + raw[w].slice(1);
        d.brand = raw.join(" ");
        break;
      }
    }
    if (card.className.indexOf("product_cat-bestseller") > -1) d.attrs.push({i:"ph-trophy", t:"Bestseller"});
    if (card.className.indexOf("product_cat-new-arrival") > -1) d.attrs.push({i:"ph-sparkle", t:"New"});
    if (card.className.indexOf("product_cat-clearance-sale") > -1) d.attrs.push({i:"ph-tag", t:"Sale"});
    if (card.className.indexOf("product-type-variable") > -1) d.attrs.push({i:"ph-faders", t:"Options"});
    if (card.className.indexOf("product-type-simple") > -1) d.attrs.push({i:"ph-package", t:"Ready"});
    return d;
  }
  function buildPills(card){
    var data = getCardData(card);
    var wrap = document.createElement("div");
    wrap.className = "cbs-card-pills";
    var pills = [];
    if (data.brand) pills.push({i:"ph-storefront", t:data.brand});
    pills.push({i: data.stock === "In stock" ? "ph-check-circle" : "ph-x-circle", t: data.stock});
    for (var i=0; i<Math.min(3, data.attrs.length); i++) pills.push(data.attrs[i]);
    pills.forEach(function(p){
      var pill = document.createElement("span");
      pill.className = "cbs-pill";
      pill.innerHTML = '<i class="ph-bold ' + p.i + '"></i><span>' + p.t + '</span>';
      wrap.appendChild(pill);
    });
    return wrap;
  }
  function wireCard(card){
    if (card.dataset.cbsWired === "1") return;
    card.dataset.cbsWired = "1";
    var trigger = card.querySelector(".clck-click");
    if (!trigger) return;
    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-label", "Quick info");
    trigger.setAttribute("aria-expanded", "false");
    var pills = card.querySelector(".cbs-card-pills");
    if (!pills) {
      pills = buildPills(card);
      var pcard = card.querySelector(".product-card") || card;
      pcard.appendChild(pills);
    }
    function close(){ pills.classList.remove("is-open"); trigger.setAttribute("aria-expanded","false"); }
    function open(){
      each(document.querySelectorAll(".cbs-card-pills.is-open"), function(o){ if (o !== pills) o.classList.remove("is-open"); });
      pills.classList.add("is-open");
      trigger.setAttribute("aria-expanded","true");
    }
    trigger.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); if (pills.classList.contains("is-open")) close(); else open(); });
    trigger.addEventListener("keydown", function(e){ if (e.key === "Enter" || e.key === " "){ e.preventDefault(); trigger.click(); } if (e.key === "Escape") close(); });
  }
  function wireAllCards(scope){
    var root = scope || document;
    each(root.querySelectorAll("li.product"), wireCard);
  }
  document.addEventListener("click", function(e){
    if (e.target.closest && (e.target.closest(".cbs-card-pills") || e.target.closest(".clck-click"))) return;
    each(document.querySelectorAll(".cbs-card-pills.is-open"), function(o){ o.classList.remove("is-open"); });
  });
  function init(){ wireAllCards(); reformatAllPrices(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  var mo = new MutationObserver(function(muts){
    muts.forEach(function(m){
      m.addedNodes && each(m.addedNodes, function(n){
        if (n.nodeType !== 1) return;
        if (n.matches && n.matches("li.product")) wireCard(n);
        if (n.querySelectorAll) {
          each(n.querySelectorAll("li.product"), wireCard);
          each(n.querySelectorAll(".product .price, ul.products .price, .product-price"), reformatPrice);
        }
      });
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });
  window.CBS = window.CBS || {};
  window.CBS.wireCards = wireAllCards;
  window.CBS.reformatPrices = reformatAllPrices;
})();
/* END CBS-JS-V2-CLEAN */


/* CBS-OS-JS - rating num + search typeahead + glitch number on price reveal */
(function(){
  function init(){
    // 1. Rating num pill: pull from sibling .cbs-star count / inline rating value
    Array.prototype.forEach.call(document.querySelectorAll(".cbs-rating"), function(r){
      if (r.dataset.cbsRatingNum) return;
      var numText = (r.textContent||"").trim().match(/[0-9]+(?:\.[0-9]+)?/);
      if (numText) { r.setAttribute("data-cbs-rating-num", numText[0]); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
/* END CBS-OS-JS */


/* CBS-PILL-V3 - idempotent, no observer loop */
(function(){
  function wireOne(card){
    var pcard = card.querySelector(".product-card");
    var pills = card.querySelector(".cbs-card-pills");
    var frame = card.querySelector(".imb-bx") || card.querySelector(".product-image");
    var trigger = card.querySelector(".clck-click");
    if (!pcard || !pills || !frame || !trigger) return;
    if (trigger.dataset.cbsPillV3 === "1") return;
    trigger.dataset.cbsPillV3 = "1";
    if (pills.parentElement !== frame) { frame.appendChild(pills); }
    function close(){ pills.classList.remove("is-open"); pcard.classList.remove("cbs-pill-open"); trigger.setAttribute("aria-expanded","false"); }
    function open(){
      Array.prototype.forEach.call(document.querySelectorAll(".cbs-pill-open"), function(c){ if (c !== pcard) c.classList.remove("cbs-pill-open"); });
      Array.prototype.forEach.call(document.querySelectorAll(".cbs-card-pills.is-open"), function(p){ if (p !== pills) p.classList.remove("is-open"); });
      pills.classList.add("is-open"); pcard.classList.add("cbs-pill-open"); trigger.setAttribute("aria-expanded","true");
    }
    trigger.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); if (pills.classList.contains("is-open")) close(); else open(); });
  }
  function run(){ Array.prototype.forEach.call(document.querySelectorAll("li.product"), wireOne); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ setTimeout(run, 80); }); else setTimeout(run, 80);
  setInterval(run, 1500); /* simple poll, no infinite mutation observer */
  document.addEventListener("click", function(e){ if (e.target.closest && (e.target.closest(".cbs-card-pills") || e.target.closest(".clck-click"))) return; Array.prototype.forEach.call(document.querySelectorAll(".cbs-card-pills.is-open"), function(p){ p.classList.remove("is-open"); var pc = p.closest(".product-card"); if (pc) pc.classList.remove("cbs-pill-open"); }); });
})();
/* END CBS-PILL-V3 */

/* CBS-CARD-V7-JS - clean. Class toggle only. CSS handles all visibility. */
(function(){
  function wireCard(card){
    if (card.dataset.cbsV7 === "1") return;
    card.dataset.cbsV7 = "1";
    var trigger = card.querySelector(".cbs-card__info");
    if (!trigger) return;
    function toggle(e){
      if (e) { e.preventDefault(); e.stopPropagation(); }
      var open = card.classList.contains("is-pill-open");
      if (open) {
        card.classList.remove("is-pill-open");
        trigger.setAttribute("aria-expanded", "false");
      } else {
        card.classList.add("is-pill-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    }
    trigger.addEventListener("click", toggle);
    trigger.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); toggle(); }
      else if (e.key === "Escape") {
        card.classList.remove("is-pill-open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
    var pills = card.querySelector(".cbs-card__pills");
    if (pills) pills.addEventListener("click", function(e){ e.stopPropagation(); });
  }
  window.cbsCloseAllPills = function(){
    var open = document.querySelectorAll(".cbs-card.is-pill-open");
    for (var i = 0; i < open.length; i++) {
      open[i].classList.remove("is-pill-open");
      var t = open[i].querySelector(".cbs-card__info");
      if (t) t.setAttribute("aria-expanded", "false");
    }
  };
  function run(){
    var nodes = document.querySelectorAll(".cbs-card");
    for (var i = 0; i < nodes.length; i++) wireCard(nodes[i]);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(run, 50); });
  } else {
    setTimeout(run, 50);
  }
  setInterval(run, 1500);
})();
/* END CBS-CARD-V7-JS */

/* CBS-TABS-V2 - tab filter + close all pills + reset scroll on tab change */
(function(){
  function wireTabs(group){
    if (group.dataset.cbsTabsV2 === "1") return;
    group.dataset.cbsTabsV2 = "1";
    var section = group.closest("section");
    if (!section) return;
    var grid = section.querySelector(".cbs-prod-grid");
    if (!grid) return;
    var tabs = group.querySelectorAll(".cbs-tab");
    function apply(filter){
      var filters = filter ? filter.split(",") : [];
      var items = grid.querySelectorAll(".cbs-prod-item");
      for (var i = 0; i < items.length; i++) {
        var cats = (items[i].dataset.cats || "").split(",");
        var match = filters.length === 0;
        if (!match) {
          for (var j = 0; j < filters.length; j++) {
            if (cats.indexOf(filters[j]) !== -1) { match = true; break; }
          }
        }
        if (match) items[i].classList.remove("is-hidden");
        else items[i].classList.add("is-hidden");
      }
    }
    for (var i = 0; i < tabs.length; i++) {
      (function(tab){
        tab.addEventListener("click", function(e){
          e.preventDefault();
          for (var k = 0; k < tabs.length; k++) {
            tabs[k].classList.remove("is-active");
            tabs[k].setAttribute("aria-selected", "false");
          }
          tab.classList.add("is-active");
          tab.setAttribute("aria-selected", "true");
          apply(tab.dataset.filter || "");
          // close all open pills inside this section
          if (typeof window.cbsCloseAllPills === "function") {
            var openCards = section.querySelectorAll(".cbs-card.is-pill-open");
            for (var k = 0; k < openCards.length; k++) {
              var fn = window.cbsCloseAllPillsSingle || function(){};
            }
            window.cbsCloseAllPills();
          }
        });
      })(tabs[i]);
    }
  }
  function run(){
    var groups = document.querySelectorAll(".cbs-tabs");
    for (var i = 0; i < groups.length; i++) wireTabs(groups[i]);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(run, 50); });
  } else {
    setTimeout(run, 50);
  }
  setInterval(run, 1500);
})();
/* END CBS-TABS-V2 */

/* ============ CBS-CAROUSEL-V14 — Safari-safe (accumulator + integer scrollLeft) ============ */
(function(){
  var DRIFT_VEL   = (window.matchMedia && window.matchMedia("(max-width:767px)").matches) ? 0 : 50;
  var TAU_DECEL   = 0.9;
  var TAU_ACCEL   = 1.2;
  var ARROW_BOOST = 700;
  var ARROW_TAU   = 0.55;
  var STOP_EPS    = 0.05;

  function setup(carousel){
    var grid = carousel.querySelector('.cbs-prod-grid');
    if (!grid) return;

    // Safari sometimes inherits momentum-touch scroll which fights programmatic writes
    grid.style.webkitOverflowScrolling = 'auto';
    grid.style.scrollSnapType = 'none';
    grid.style.scrollBehavior = 'auto';

    var prevBtn = carousel.querySelector('.cbs-prod-arrow--prev');
    var nextBtn = carousel.querySelector('.cbs-prod-arrow--next');

    var state = {
      hovering: false,
      pageHidden: document.visibilityState !== 'visible',
      velocity: 0,
      scrollPos: grid.scrollLeft || 0,  // fractional accumulator
      lastTs: 0,
      rafId: 0,
      boostUntil: 0,
      lastApplied: -1
    };

    function getStride(){
      var item = grid.querySelector('.cbs-prod-item');
      return item ? (item.offsetWidth + 16) : 280;
    }
    function targetVel(){
      if (state.pageHidden) return 0;
      if (state.hovering)   return 0;
      return DRIFT_VEL;
    }
    function currentTau(now){
      if (now < state.boostUntil) return ARROW_TAU;
      return (Math.abs(state.velocity) > Math.abs(targetVel())) ? TAU_DECEL : TAU_ACCEL;
    }

    function tick(ts){
      if (!grid.isConnected) { state.rafId = 0; return; }
      if (!state.lastTs) state.lastTs = ts;
      var dt = (ts - state.lastTs) / 1000;
      if (dt > 0.1) dt = 0.1;
      state.lastTs = ts;

      var tv = targetVel();
      var tau = currentTau(ts);
      var k = 1 - Math.exp(-dt / tau);
      state.velocity += (tv - state.velocity) * k;
      if (Math.abs(state.velocity - tv) < STOP_EPS) state.velocity = tv;

      var maxL = grid.scrollWidth - grid.clientWidth;
      if (maxL > 0 && state.velocity !== 0) {
        state.scrollPos += state.velocity * dt;
        if (state.scrollPos > maxL) state.scrollPos = 0;
        else if (state.scrollPos < 0) state.scrollPos = maxL;
        var px = Math.round(state.scrollPos);
        if (px !== state.lastApplied) {
          grid.scrollLeft = px;
          state.lastApplied = px;
        }
      }

      var stillActive = Math.abs(state.velocity) > STOP_EPS || tv !== 0 || ts < state.boostUntil;
      state.rafId = stillActive ? requestAnimationFrame(tick) : 0;
    }

    function kick(){
      if (state.rafId) return;
      state.lastTs = 0;
      // resync accumulator from real scroll if user/Safari changed it externally
      state.scrollPos = grid.scrollLeft || 0;
      state.lastApplied = -1;
      state.rafId = requestAnimationFrame(tick);
    }

    function arrowSkip(dir){
      state.velocity = ARROW_BOOST * (dir > 0 ? 1 : -1);
      state.boostUntil = performance.now() + 900;
      kick();
    }

    // Hover bound to GRID (not carousel) so hovering arrows doesn't pause
    grid.addEventListener('mouseenter', function(){ state.hovering = true;  kick(); });
    grid.addEventListener('mouseleave', function(){ state.hovering = false; kick(); });
    grid.addEventListener('touchstart', function(){ state.hovering = true;  kick(); }, {passive:true});
    grid.addEventListener('touchend',   function(){ state.hovering = false; kick(); }, {passive:true});
    grid.addEventListener('touchcancel',function(){ state.hovering = false; kick(); }, {passive:true});

    if (prevBtn) prevBtn.addEventListener('click', function(e){ e.preventDefault(); arrowSkip(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function(e){ e.preventDefault(); arrowSkip(1); });

    var section = carousel.closest('section') || document;
    section.querySelectorAll('.cbs-tabs__tab').forEach(function(tab){
      tab.addEventListener('click', function(){
        setTimeout(function(){
          grid.scrollLeft = 0;
          state.scrollPos = 0;
          state.velocity = 0;
          state.boostUntil = 0;
          state.lastApplied = -1;
          kick();
        }, 80);
      });
    });

    document.addEventListener('visibilitychange', function(){
      state.pageHidden = document.visibilityState !== 'visible';
      kick();
    });

    kick();
    carousel.__cbsCarouselV14 = { state: state, arrowSkip: arrowSkip, kick: kick };
  }

  function init(){
    document.querySelectorAll('.cbs-prod-carousel').forEach(setup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
/* ============ /CBS-CAROUSEL-V14 ============ */
/* END CBS-CAROUSEL-V6 */

/* CBS-WISH-V1 - custom wishlist: localStorage + REST sync for logged-in users (CBS-WISHLIST-V2 patched) */
(function(){
  var KEY = "cbs_wishlist";
  var PENDING = "cbs_wishlist_pending";
  var cfg = (typeof window.cbsWishConfig === "object" && window.cbsWishConfig) ? window.cbsWishConfig : {};
  var loggedIn = !!(cfg.userId && cfg.userId > 0);
  function getLocal(){
    try { var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw).map(String) : []; }
    catch(e) { return []; }
  }
  function saveLocal(arr){ try { localStorage.setItem(KEY, JSON.stringify(arr.map(String))); } catch(e) {} }
  function getPending(){
    try { var raw = localStorage.getItem(PENDING); return raw ? JSON.parse(raw).map(String) : []; }
    catch(e) { return []; }
  }
  function clearPending(){ try { localStorage.removeItem(PENDING); } catch(e) {} }
  function isIn(id){ return getLocal().indexOf(String(id)) !== -1; }
  function pushToServer(list){
    if (!loggedIn || !cfg.restUrl) return;
    try {
      fetch(cfg.restUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-WP-Nonce": cfg.nonce || "" },
        credentials: "same-origin",
        body: JSON.stringify({ list: list })
      }).catch(function(){});
    } catch(e) {}
  }
  function mergeLists(a, b){
    var out = [].concat(a);
    for (var i = 0; i < b.length; i++) {
      var s = String(b[i]);
      if (out.indexOf(s) === -1) out.push(s);
    }
    return out;
  }
  function announce(){
    try { window.dispatchEvent(new CustomEvent("cbs:wishlist-change", { detail: { list: getLocal() } })); } catch(e) {}
  }
  // On boot: logged in -> merge server initialList + local + any pending guest saves, persist, then ALWAYS announce
  // so the nav badge reflects the merged list on first paint (fixes stale first-paint badge + drains guest pending).
  if (loggedIn) {
    var local0 = getLocal();
    var server = Array.isArray(cfg.initialList) ? cfg.initialList.map(String) : [];
    var pending = getPending();
    var merged = mergeLists(mergeLists(local0, server), pending);
    var changed = merged.length !== local0.length || merged.some(function(v, i){ return v !== local0[i]; });
    if (changed) saveLocal(merged);
    if (merged.length > server.length) pushToServer(merged);
    if (pending.length) clearPending();
    announce();
  }
  function toggle(id){
    var list = getLocal();
    var sid = String(id);
    var idx = list.indexOf(sid);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(sid);
    saveLocal(list);
    pushToServer(list);
    return list;
  }
  function syncBtn(btn){
    var id = btn.getAttribute("data-product-id");
    var on = loggedIn && isIn(id);
    if (on) {
      btn.classList.add("is-added");
      btn.setAttribute("aria-pressed", "true");
      btn.setAttribute("aria-label", "Remove from wishlist");
    } else {
      btn.classList.remove("is-added");
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("aria-label", "Add to wishlist");
    }
  }
  function syncAll(){
    var all = document.querySelectorAll(".cbs-wish");
    for (var i = 0; i < all.length; i++) syncBtn(all[i]);
  }
  function wireBtn(btn){
    if (btn.dataset.cbsWishV1 === "1") return;
    btn.dataset.cbsWishV1 = "1";
    syncBtn(btn);
    btn.addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      var pid = btn.getAttribute("data-product-id");
      // Logged OUT: do NOT toggle/fill. Open the CBS wishlist popup (login-to-save / add-to-cart).
      if (!loggedIn) {
        if (window.cbsWishPopup && window.cbsWishPopup.open) window.cbsWishPopup.open(pid, "guest");
        return;
      }
      toggle(pid);
      syncAll();
      announce();
    });
  }
  function run(){
    var nodes = document.querySelectorAll(".cbs-wish");
    for (var i = 0; i < nodes.length; i++) wireBtn(nodes[i]);
  }
  window.addEventListener("storage", function(e){ if (e.key === KEY) syncAll(); });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(run, 50); });
  } else {
    setTimeout(run, 50);
  }
  setInterval(run, 1500);
})();
/* END CBS-WISH-V1 */

/* CBS-WISH block #2 (dead duplicate localStorage-only handler) removed in CBS-WISHLIST-V2 */















/* ============ CBS-NOTIFY-V1 — OOS notify-me modal ============ */
(function(){
  function buildModal(){
    if (document.getElementById('cbsNotifyBackdrop')) return document.getElementById('cbsNotifyBackdrop');
    var bd = document.createElement('div');
    bd.id = 'cbsNotifyBackdrop';
    bd.className = 'cbs-notify-backdrop';
    bd.setAttribute('aria-hidden','true');
    bd.innerHTML = 
      '<div class="cbs-notify-modal" role="dialog" aria-modal="true" aria-labelledby="cbsNotifyTitle">' +
      '<button type="button" class="cbs-notify-modal__close" aria-label="Close">&times;</button>' +
      '<p class="cbs-notify-modal__eyebrow">RESTOCK ALERT</p>' +
      '<h3 id="cbsNotifyTitle" class="cbs-notify-modal__title">NOTIFY ME</h3>' +
      '<p class="cbs-notify-modal__sub" id="cbsNotifySub">Drop your email and we will ping you the moment it is back.</p>' +
      '<form class="cbs-notify-modal__form" id="cbsNotifyForm">' +
      '<input type="email" class="cbs-notify-modal__input" id="cbsNotifyEmail" placeholder="you@email.com" required>' +
      '<button type="submit" class="cbs-notify-modal__submit">NOTIFY</button>' +
      '</form>' +
      '<p class="cbs-notify-modal__msg" id="cbsNotifyMsg"></p>' +
      '</div>';
    document.body.appendChild(bd);
    bd.querySelector('.cbs-notify-modal__close').addEventListener('click', close);
    bd.addEventListener('click', function(e){ if (e.target === bd) close(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
    bd.querySelector('#cbsNotifyForm').addEventListener('submit', submit);
    return bd;
  }

  function open(productId, productName){
    var bd = buildModal();
    bd.dataset.productId = productId || '';
    bd.dataset.productName = productName || '';
    var sub = bd.querySelector('#cbsNotifySub');
    sub.textContent = productName ? ('Get pinged when "' + productName + '" is back in stock.') : 'Drop your email and we will ping you the moment it is back.';
    var msg = bd.querySelector('#cbsNotifyMsg'); msg.textContent = ''; msg.className = 'cbs-notify-modal__msg';
    bd.querySelector('#cbsNotifyEmail').value = '';
    bd.classList.add('is-open');
    bd.setAttribute('aria-hidden','false');
    setTimeout(function(){ bd.querySelector('#cbsNotifyEmail').focus(); }, 60);
  }

  function close(){
    var bd = document.getElementById('cbsNotifyBackdrop');
    if (bd) { bd.classList.remove('is-open'); bd.setAttribute('aria-hidden','true'); }
  }

  function submit(e){
    e.preventDefault();
    var bd = document.getElementById('cbsNotifyBackdrop');
    var msg = bd.querySelector('#cbsNotifyMsg');
    var email = bd.querySelector('#cbsNotifyEmail').value.trim();
    var pid = bd.dataset.productId;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = 'Enter a valid email.';
      msg.className = 'cbs-notify-modal__msg is-error';
      return;
    }
    msg.textContent = 'Submitting...';
    msg.className = 'cbs-notify-modal__msg';
    var cfg = window.cbsWishConfig || {};
    var base = (cfg.restUrl || '').replace(/wishlist\/?$/, '');
    var url = base + 'notify';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': cfg.nonce || '' },
      credentials: 'same-origin',
      body: JSON.stringify({ product_id: pid, email: email })
    }).then(function(r){ return r.json().catch(function(){ return null; }); }).then(function(data){
      if (data && data.success) {
        msg.textContent = 'Got it. We will hit your inbox when it is back.';
        msg.className = 'cbs-notify-modal__msg is-ok';
        setTimeout(close, 1600);
      } else {
        msg.textContent = (data && data.message) || 'Could not save. Try again.';
        msg.className = 'cbs-notify-modal__msg is-error';
      }
    }).catch(function(){
      msg.textContent = 'Network error. Try again.';
      msg.className = 'cbs-notify-modal__msg is-error';
    });
  }

  // Delegate click on any NOTIFY ME CTA
  document.addEventListener('click', function(e){
    var t = e.target;
    if (!t || !t.closest) return;
    var btn = t.closest('.cbs-card__cta.is-notify');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var card = btn.closest('.cbs-card');
    var pid = '';
    if (card) {
      var wish = card.querySelector('.cbs-wish[data-product-id]');
      if (wish) pid = wish.getAttribute('data-product-id') || '';
    }
    var titleEl = card ? card.querySelector('.cbs-card__title') : null;
    var pname = titleEl ? titleEl.textContent.trim() : '';
    open(pid, pname);
  });

  // Expose so other CBS modules (e.g. the wishlist page) can trigger the restock modal directly.
  try { window.cbsNotifyOpen = open; } catch(e) {}
})();
/* ============ /CBS-NOTIFY-V1 ============ */

/* ============ CBS-BP-SHAPE-V1 — per-card SVG path + clip-path ============ */
(function(){
  var CORNER_R = 8;
  var NOTCH_R  = 8;
  var TOP_STRIP_H = 36; // matches CSS padding 9*2 + font 10.5px ~= 36

  function buildPath(W, H){
    var c = CORNER_R, n = NOTCH_R;
    // Notch sits exactly at the seam between image-frame and body
    // Image frame is 1:1 aspect so its height = card content width = W
    var notchY = TOP_STRIP_H + W;
    // Safety: keep within card
    if (notchY < c + n)        notchY = c + n;
    if (notchY > H - c - n)    notchY = H - c - n;
    return [
      'M', c, 0,
      'H', W-c,
      'A', c, c, 0, 0, 1, W, c,
      'V', notchY-n,
      'A', n, n, 0, 0, 0, W, notchY+n,
      'V', H-c,
      'A', c, c, 0, 0, 1, W-c, H,
      'H', c,
      'A', c, c, 0, 0, 1, 0, H-c,
      'V', notchY+n,
      'A', n, n, 0, 0, 0, 0, notchY-n,
      'V', c,
      'A', c, c, 0, 0, 1, c, 0,
      'Z'
    ].join(' ');
  }

  function apply(card){
    var svg  = card.querySelector('.cbs-bp__shape');
    if (!svg) return;
    var path = svg.querySelector('.cbs-bp__shape-path');
    if (!path) return;
    var r = card.getBoundingClientRect();
    var W = Math.round(r.width), H = Math.round(r.height);
    if (W < 1 || H < 1) return;
    var d = buildPath(W, H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    path.setAttribute('d', d);
    // Clip the inner content wrapper (not the card) so the SVG stroke isn't clipped too
    var inner = card.querySelector('.cbs-bp__inner');
    if (inner) {
      var cp = 'path("' + d + '")';
      inner.style.clipPath = cp;
      inner.style.webkitClipPath = cp;
    }
  }

  function applyAll(){
    document.querySelectorAll('.cbs-card.cbs-card--bp').forEach(apply);
  }

  var ro = ('ResizeObserver' in window) ? new ResizeObserver(function(entries){
    entries.forEach(function(e){ if (e.target && e.target.classList && e.target.classList.contains('cbs-card--bp')) apply(e.target); });
  }) : null;

  function init(){
    applyAll();
    if (ro) document.querySelectorAll('.cbs-card.cbs-card--bp').forEach(function(c){ ro.observe(c); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Belt-and-braces: also re-apply on full image load (images can change card height as they load)
  window.addEventListener('load', applyAll);
  window.addEventListener('resize', function(){ requestAnimationFrame(applyAll); });
})();
/* ============ /CBS-BP-SHAPE-V1 ============ */

/* ============ CBS-WISH-POPUP-V1 — logged-out save / variation-aware add-to-cart ============ */
(function(){
  var cfg = (typeof window.cbsWishConfig === "object" && window.cbsWishConfig) ? window.cbsWishConfig : {};
  var PENDING = "cbs_wishlist_pending";
  var cache = {};

  function productUrl(pid){
    if (cfg.productBase) return cfg.productBase + pid;
    var base = cfg.restUrl || "/wp-json/cbs/v1/wishlist";
    var cut = base.indexOf("wishlist");
    if (cut !== -1) base = base.substring(0, cut);
    return base + "product/" + pid;
  }
  function fetchProduct(pid){
    pid = String(pid);
    if (cache[pid]) return Promise.resolve(cache[pid]);
    return fetch(productUrl(pid), { credentials: "same-origin" })
      .then(function(r){ return r.json(); })
      .then(function(d){ cache[pid] = d; return d; });
  }

  function notifyCartChanged(){
    try { if (window.jQuery) window.jQuery(document.body).trigger("wc_fragment_refresh"); } catch(e) {}
    try { window.dispatchEvent(new CustomEvent("cbs:cart:changed")); } catch(e) {}
    try { if (window.jQuery) window.jQuery(document.body).trigger("cbs:cart:changed"); } catch(e) {}
  }
  function toast(text){
    /* CBS-AUDIT-0804: this used to build an UNSTYLED <div class="custom-success-message">
       and rely on footer.php's CBS-TOAST-V1 MutationObserver to spot it and convert it into
       a real .cbs-toast. Same result, one hop fewer, and no unstyled node ever enters the
       DOM. The old path is kept as a fallback in case the footer script is absent. */
    try {
      if (typeof window.cbsToast === "function") { window.cbsToast(text, "success"); return; }
      var t = document.createElement("div");
      t.className = "custom-success-message";
      t.innerHTML = "<span>" + text + "</span>";
      document.body.appendChild(t);
      setTimeout(function(){ if (t.parentNode) t.parentNode.removeChild(t); }, 4500);
    } catch(e) {}
  }
  function applyFragments(frags){
    // cart-fragments.js is not loaded site-wide here, so apply the add-to-cart response fragments
    // ourselves (the nav cart badge ".cart-count" is one of them). Mirrors WC cart-fragments behaviour.
    if (!frags) return;
    try {
      for (var key in frags){
        if (!frags.hasOwnProperty(key)) continue;
        var html = frags[key];
        if (typeof html !== "string") continue;
        var els = document.querySelectorAll(key);
        for (var i = 0; i < els.length; i++){
          var tmp = document.createElement("div");
          tmp.innerHTML = html;
          var rep = tmp.firstElementChild;
          if (rep && els[i].parentNode) els[i].parentNode.replaceChild(rep, els[i]);
        }
      }
    } catch(e) {}
  }
  function addToCart(productId, variationId, variationAttrs){
    var body = new URLSearchParams();
    // WC_AJAX::add_to_cart resolves a variation ONLY when product_id IS the variation id
    // (it ignores a separate variation_id/variation[]). So add the variation by its own id.
    body.append("product_id", String(variationId ? variationId : productId));
    body.append("quantity", "1");
    return fetch("/?wc-ajax=add_to_cart", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    }).then(function(r){ return r.json().catch(function(){ return {}; }); })
      .then(function(data){
        if (data && data.error) return { ok: false, message: "Could not add to cart." };
        if (data && data.fragments) applyFragments(data.fragments);
        notifyCartChanged();
        /* CBS-AUDIT-0804: the floating toast used to fire here UNCONDITIONALLY while the
           caller ALSO played its own in-button confirmation, so one tap produced two "it
           worked" signals. All four call sites (card CTA, variation popup, wishlist add,
           wishlist add-all) show inline feedback on the control the user just pressed, so
           the toast is redundant — the eyes are already on the button. */
        return { ok: true };
      }).catch(function(){ return { ok: false, message: "Network error. Try again." }; });
  }

  function escapeHtml(s){
    s = (s == null) ? "" : String(s);
    return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split('"').join("&quot;");
  }
  function escapeAttr(s){ return escapeHtml(s).split("'").join("&#39;"); }
  function normVal(v){ return (v == null) ? "" : String(v).toLowerCase().trim(); }
  function varMatches(vari, sel){
    for (var k in sel){
      if (!sel.hasOwnProperty(k)) continue;
      if (sel[k] == null || sel[k] === "") continue;
      var vv = vari.attributes[k];
      if (vv == null || vv === "") continue;
      if (normVal(vv) !== normVal(sel[k])) return false;
    }
    return true;
  }
  function optionAvailable(prod, key, value, sel){
    var test = {};
    for (var k in sel){ if (k !== key && sel.hasOwnProperty(k)) test[k] = sel[k]; }
    test[key] = value;
    for (var i = 0; i < prod.variations.length; i++){
      var v = prod.variations[i];
      if (v.is_in_stock === false || v.is_purchasable === false) continue;
      if (varMatches(v, test)) return true;
    }
    return false;
  }
  function findVariation(prod, sel){
    for (var i = 0; i < prod.variations.length; i++){
      if (varMatches(prod.variations[i], sel)) return prod.variations[i];
    }
    return null;
  }
  function pickDefaultVariation(prod){
    if (!prod || prod.type !== "variable" || !prod.variations || !prod.variations.length) return null;
    var chosen = null;
    for (var i = 0; i < prod.variations.length; i++){
      var v = prod.variations[i];
      if (v.is_in_stock !== false && v.is_purchasable !== false) { chosen = v; break; }
    }
    if (!chosen) return null;
    var sel = {};
    var attrs = prod.attributes || [];
    for (var a = 0; a < attrs.length; a++){
      var key = attrs[a].key;
      var vv = chosen.attributes[key];
      if (vv) sel[key] = vv;
      else if (attrs[a].options.length) sel[key] = attrs[a].options[0].value;
    }
    return { variation_id: chosen.variation_id, attrs: sel };
  }

  function buildModal(){
    var ex = document.getElementById("cbsWishpopBackdrop");
    if (ex) return ex;
    var bd = document.createElement("div");
    bd.id = "cbsWishpopBackdrop";
    bd.className = "cbs-wishpop-backdrop";
    bd.innerHTML =
      '<div class="cbs-wishpop" role="dialog" aria-modal="true">' +
      '<button type="button" class="cbs-wishpop__close" aria-label="Close">&times;</button>' +
      '<p class="cbs-wishpop__eyebrow" data-eyebrow>Save to wishlist</p>' +
      '<div class="cbs-wishpop__bodywrap" data-body><div class="cbs-wishpop__loading">Loading...</div></div>' +
      '</div>';
    document.body.appendChild(bd);
    bd.querySelector(".cbs-wishpop__close").addEventListener("click", close);
    bd.addEventListener("click", function(e){ if (e.target === bd) close(); });
    document.addEventListener("keydown", function(e){ if (e.key === "Escape") close(); });
    return bd;
  }
  function close(){
    var bd = document.getElementById("cbsWishpopBackdrop");
    if (bd) bd.classList.remove("is-open");
  }

  function open(pid, mode){
    mode = mode || "guest";
    var bd = buildModal();
    bd.classList.add("is-open");
    var eyebrow = bd.querySelector("[data-eyebrow]");
    var body = bd.querySelector("[data-body]");
    eyebrow.textContent = (mode === "cart") ? "Add to cart" : "Save to wishlist";
    body.innerHTML = '<div class="cbs-wishpop__loading">Loading...</div>';
    fetchProduct(pid).then(function(prod){
      if (!prod || prod.error || !prod.id) { body.innerHTML = '<div class="cbs-wishpop__loading">Product unavailable.</div>'; return; }
      render(bd, prod, mode);
    }).catch(function(){ body.innerHTML = '<div class="cbs-wishpop__loading">Could not load product.</div>'; });
  }

  function render(bd, prod, mode){
    var body = bd.querySelector("[data-body]");
    var isVar = prod.type === "variable" && prod.attributes && prod.attributes.length;
    var sel = {};

    var head =
      '<div class="cbs-wishpop__head">' +
        '<div class="cbs-wishpop__thumb">' + (prod.image ? '<img src="' + prod.image + '" alt="">' : '') + '</div>' +
        '<div class="cbs-wishpop__headinfo">' +
          '<h3 class="cbs-wishpop__name">' + escapeHtml(prod.name) + '</h3>' +
          '<div class="cbs-wishpop__line">' +
            '<span class="cbs-wishpop__price" data-price>' + (prod.price_html || "") + '</span>' +
            '<span class="cbs-wishpop__stock" data-stock></span>' +
          '</div>' +
        '</div>' +
      '</div>';
    body.innerHTML = head + (isVar ? '<div class="cbs-wishpop__vars" data-vars></div>' : "") +
      '<div class="cbs-wishpop__actions" data-actions></div>' +
      '<p class="cbs-wishpop__msg" data-msg></p>';

    var priceEl = body.querySelector("[data-price]");
    var stockEl = body.querySelector("[data-stock]");
    var varsEl = body.querySelector("[data-vars]");
    var actionsEl = body.querySelector("[data-actions]");
    var msgEl = body.querySelector("[data-msg]");

    function setMsg(text, cls){ msgEl.textContent = text || ""; msgEl.className = "cbs-wishpop__msg" + (cls ? " " + cls : ""); }
    function setStock(inStock){
      stockEl.className = "cbs-wishpop__stock " + (inStock ? "is-in" : "is-out");
      stockEl.textContent = inStock ? "In stock" : "Sold out";
    }
    function currentVariation(){
      if (!isVar) return null;
      for (var a = 0; a < prod.attributes.length; a++){ if (!sel[prod.attributes[a].key]) return null; }
      return findVariation(prod, sel);
    }
    function renderChips(){
      var html = "";
      for (var a = 0; a < prod.attributes.length; a++){
        var attr = prod.attributes[a];
        html += '<div class="cbs-wishpop__group"><span class="cbs-wishpop__grouplabel">' + escapeHtml(attr.name) + '</span><div class="cbs-wishpop__chips">';
        for (var o = 0; o < attr.options.length; o++){
          var opt = attr.options[o];
          var avail = optionAvailable(prod, attr.key, opt.value, sel);
          var active = sel[attr.key] != null && normVal(sel[attr.key]) === normVal(opt.value);
          var cls = "cbs-wishpop__chip" + (active ? " is-active" : "") + (avail ? "" : " is-oos");
          html += '<button type="button" class="' + cls + '" data-attr="' + escapeAttr(attr.key) + '" data-val="' + escapeAttr(opt.value) + '"' + (avail ? "" : " disabled") + '>' + escapeHtml(opt.label) + '</button>';
        }
        html += '</div></div>';
      }
      varsEl.innerHTML = html;
      var chips = varsEl.querySelectorAll(".cbs-wishpop__chip");
      for (var i = 0; i < chips.length; i++) chips[i].addEventListener("click", onChip);
    }
    function onChip(e){
      var btn = e.currentTarget;
      if (btn.classList.contains("is-oos")) return;
      var key = btn.getAttribute("data-attr");
      sel[key] = btn.getAttribute("data-val");
      for (var a = 0; a < prod.attributes.length; a++){
        var k = prod.attributes[a].key;
        if (k === key) continue;
        if (sel[k] && !optionAvailable(prod, k, sel[k], sel)) sel[k] = null;
      }
      repaint();
    }
    function updateActions(){
      var v = currentVariation();
      var canAdd = isVar ? !!(v && v.is_in_stock !== false && v.is_purchasable !== false) : (prod.in_stock !== false);
      var html = "";
      if (mode === "guest") {
        html += '<button type="button" class="cbs-wishpop__btn cbs-wishpop__btn--primary" data-login>Log in to save <i class="ph-bold ph-arrow-right"></i></button>';
        html += '<div class="cbs-wishpop__or">or</div>';
        html += '<button type="button" class="cbs-wishpop__btn cbs-wishpop__btn--ghost" data-add' + (canAdd ? "" : " disabled") + '>Add to cart <i class="ph-bold ph-shopping-cart-simple"></i></button>';
      } else {
        html += '<button type="button" class="cbs-wishpop__btn cbs-wishpop__btn--primary" data-add' + (canAdd ? "" : " disabled") + '>Add to cart <i class="ph-bold ph-shopping-cart-simple"></i></button>';
      }
      actionsEl.innerHTML = html;
      var loginBtn = actionsEl.querySelector("[data-login]");
      if (loginBtn) loginBtn.addEventListener("click", doLogin);
      var addBtn = actionsEl.querySelector("[data-add]");
      if (addBtn) addBtn.addEventListener("click", doAdd);
    }
    function repaint(){
      if (isVar) renderChips();
      var v = currentVariation();
      if (v) {
        if (v.price_html) priceEl.innerHTML = v.price_html;
        if (v.image) {
          var im = bd.querySelector(".cbs-wishpop__thumb img");
          if (im) im.src = v.image; else bd.querySelector(".cbs-wishpop__thumb").innerHTML = '<img src="' + v.image + '" alt="">';
        }
        setStock(v.is_in_stock !== false);
      } else {
        priceEl.innerHTML = prod.price_html || "";
        setStock(prod.in_stock !== false);
      }
      updateActions();
    }
    function doLogin(){
      try {
        var raw = localStorage.getItem(PENDING);
        var arr = raw ? JSON.parse(raw).map(String) : [];
        if (arr.indexOf(String(prod.id)) === -1) arr.push(String(prod.id));
        localStorage.setItem(PENDING, JSON.stringify(arr));
      } catch(e) {}
      var login = cfg.loginUrl || "/login/";
      var sep = login.indexOf("?") === -1 ? "?" : "&";
      window.location.href = login + sep + "redirect_to=" + encodeURIComponent(window.location.href);
    }
    function doAdd(e){
      var btn = e.currentTarget;
      if (btn.getAttribute("disabled") !== null) return;
      var v = currentVariation();
      if (isVar && !v) { setMsg("Select options to continue.", "is-error"); return; }
      btn.classList.add("is-busy"); setMsg("Adding...", "");
      var vid = v ? v.variation_id : 0;
      var attrs = v ? sel : null;
      addToCart(prod.id, vid, attrs).then(function(res){
        btn.classList.remove("is-busy");
        if (res.ok) {
          btn.classList.add("is-done");
          btn.innerHTML = "Added to cart";
          setMsg("", "");
          setTimeout(close, 1100);
        } else {
          setMsg(res.message || "Could not add.", "is-error");
        }
      });
    }

    if (isVar) {
      var def = pickDefaultVariation(prod);
      if (def) sel = def.attrs;
    }
    repaint();
  }

  window.cbsWishPopup = {
    open: open,
    close: close,
    addToCart: addToCart,
    fetchProduct: fetchProduct,
    pickDefaultVariation: pickDefaultVariation,
    notifyCartChanged: notifyCartChanged
  };
})();
/* ============ /CBS-WISH-POPUP-V1 ============ */

/* ============ CBS-WISHLIST-PAGE-V1 — remove / add / add-all / share / live count ============ */
(function(){
  function root(){ return document.querySelector(".cbs-wl"); }
  function POP(){ return window.cbsWishPopup || {}; }

  function recount(){
    var r = root(); if (!r) return;
    var grid = r.querySelector("[data-cbs-wl-grid]");
    var n = grid ? grid.querySelectorAll(".cbs-wl__card").length : 0;
    var cEl = r.querySelector("[data-cbs-wl-count]");
    if (cEl) cEl.textContent = String(n);
    if (n === 0) showEmpty();
  }
  function showEmpty(){
    var r = root(); if (!r) return;
    var pop = r.querySelector(".cbs-wl__populated");
    var emp = r.querySelector(".cbs-wl__empty");
    if (pop) pop.style.display = "none";
    if (emp) emp.removeAttribute("hidden");
  }
  function localRemove(pid){
    try {
      var raw = localStorage.getItem("cbs_wishlist");
      var arr = raw ? JSON.parse(raw).map(String) : [];
      var idx = arr.indexOf(String(pid));
      if (idx !== -1) { arr.splice(idx, 1); localStorage.setItem("cbs_wishlist", JSON.stringify(arr)); }
      var cfg = window.cbsWishConfig || {};
      if (cfg.restUrl && cfg.userId) {
        fetch(cfg.restUrl, { method: "POST", headers: { "Content-Type": "application/json", "X-WP-Nonce": cfg.nonce || "" }, credentials: "same-origin", body: JSON.stringify({ list: arr }) }).catch(function(){});
      }
      window.dispatchEvent(new CustomEvent("cbs:wishlist-change", { detail: { list: arr } }));
    } catch(e) {}
  }
  /* CBS-AUDIT-0804: delegates to the shared CBS-FLASH-V1 helper (was one of two
     near-duplicate implementations). Signature and every call site are unchanged. */
  function flash(btn, text, restore){
    if (window.cbsFlash) { window.cbsFlash(btn, text, restore); return; }
    btn.classList.add("is-done");
    btn.innerHTML = text;
    setTimeout(function(){ btn.classList.remove("is-done"); btn.innerHTML = restore; }, 1700);
  }

  function onClick(e){
    var t = e.target; if (!t || !t.closest) return;
    var r = root(); if (!r) return;

    var rm = t.closest("[data-cbs-wl-remove]");
    if (rm) {
      e.preventDefault();
      var card = rm.closest(".cbs-wl__card");
      if (!card) return;
      localRemove(card.getAttribute("data-product-id"));
      card.classList.add("is-removing");
      setTimeout(function(){ if (card.parentNode) card.parentNode.removeChild(card); recount(); }, 340);
      return;
    }

    var add = t.closest("[data-cbs-wl-add]");
    if (add) {
      e.preventDefault();
      var card2 = add.closest(".cbs-wl__card"); if (!card2) return;
      var pid2 = card2.getAttribute("data-product-id");
      var type2 = card2.getAttribute("data-product-type");
      var pop = POP();
      if (type2 === "variable") { if (pop.open) pop.open(pid2, "cart"); return; }
      if (!pop.addToCart) return;
      add.classList.add("is-busy");
      pop.addToCart(pid2, 0, null).then(function(res){
        add.classList.remove("is-busy");
        if (res && res.ok) flash(add, 'Added <i class="ph-bold ph-check"></i>', 'Add to cart <i class="ph-bold ph-shopping-cart-simple"></i>');
      });
      return;
    }

    var notify = t.closest("[data-cbs-wl-notify]");
    if (notify) {
      e.preventDefault();
      var card3 = notify.closest(".cbs-wl__card");
      var pid3 = card3 ? card3.getAttribute("data-product-id") : "";
      var name3 = card3 ? card3.getAttribute("data-product-name") : "";
      if (window.cbsNotifyOpen) window.cbsNotifyOpen(pid3, name3);
      return;
    }

    var addall = t.closest("[data-cbs-wl-addall]");
    if (addall) { e.preventDefault(); doAddAll(addall); return; }

    var share = t.closest("[data-cbs-wl-share]");
    if (share) { e.preventDefault(); doShare(share); return; }
  }

  function doAddAll(btn){
    var r = root(); if (!r) return;
    var cards = r.querySelectorAll("[data-cbs-wl-grid] .cbs-wl__card");
    var pop = POP();
    if (!pop.addToCart || !cards.length) return;
    var items = [];
    for (var i = 0; i < cards.length; i++){
      var st = cards[i].querySelector(".cbs-wl__stock");
      if (st && st.classList.contains("is-out")) continue;
      items.push({ pid: cards[i].getAttribute("data-product-id"), type: cards[i].getAttribute("data-product-type") });
    }
    if (!items.length) return;
    btn.classList.add("is-busy");
    var idx = 0;
    function step(){
      if (idx >= items.length) {
        btn.classList.remove("is-busy");
        flash(btn, "Added to cart", 'Add all to cart <i class="ph-bold ph-shopping-cart-simple"></i>');
        return;
      }
      var it = items[idx++];
      var p;
      if (it.type === "variable") {
        p = pop.fetchProduct(it.pid).then(function(prod){
          var def = pop.pickDefaultVariation(prod);
          return def ? pop.addToCart(prod.id, def.variation_id, def.attrs) : null;
        });
      } else {
        p = pop.addToCart(it.pid, 0, null);
      }
      Promise.resolve(p).then(step, step);
    }
    step();
  }

  function doShare(btn){
    var r = root(); if (!r) return;
    var cards = r.querySelectorAll("[data-cbs-wl-grid] .cbs-wl__card");
    var ids = [];
    for (var i = 0; i < cards.length; i++){ ids.push(cards[i].getAttribute("data-product-id")); }
    var url = window.location.origin + "/wishlist/?ids=" + ids.join("-");
    if (navigator.share) { navigator.share({ title: "My CBS Wishlist", url: url }).catch(function(){}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function(){ flash(btn, "Link copied", 'Share <i class="ph-bold ph-share-network"></i>'); }, function(){ window.prompt("Copy your wishlist link:", url); });
    } else {
      window.prompt("Copy your wishlist link:", url);
    }
  }

  function pruneDead(){
    /* CBS-WISH-PRUNE-V1 - drop saved ids whose product no longer exists.
       Gated to the owner's populated view; every candidate is re-checked
       against cbs/v1/product/<id> before removal, so a render hiccup can
       never wipe a live list. Writes localStorage + user_meta so the
       server-rendered nav badge agrees with the page on next load. */
    try {
      var cfg = window.cbsWishConfig || {};
      if (!cfg.userId || cfg.userId <= 0) return;
      if (/[?&]ids=/.test(location.search)) return;
      var r = root(); if (!r) return;
      var grid = r.querySelector("[data-cbs-wl-grid]"); if (!grid) return;
      var cards = grid.querySelectorAll(".cbs-wl__card"); if (!cards.length) return;
      var shown = {};
      for (var i = 0; i < cards.length; i++) {
        var pid = cards[i].getAttribute("data-product-id");
        if (pid) shown[String(pid)] = 1;
      }
      var raw = localStorage.getItem("cbs_wishlist");
      var stored = raw ? JSON.parse(raw).map(String) : [];
      var missing = stored.filter(function(id){ return !shown[id]; });
      if (!missing.length) return;
      var base = cfg.productBase || "/wp-json/cbs/v1/product/";
      Promise.all(missing.map(function(id){
        return fetch(base + id, { credentials: "same-origin" })
          .then(function(res){ return res.ok ? null : id; })
          .catch(function(){ return null; });
      })).then(function(res){
        var dead = res.filter(function(x){ return x; });
        if (!dead.length) return;
        var keep = stored.filter(function(id){ return dead.indexOf(id) === -1; });
        localStorage.setItem("cbs_wishlist", JSON.stringify(keep));
        if (cfg.restUrl) {
          fetch(cfg.restUrl, { method: "POST", headers: { "Content-Type": "application/json", "X-WP-Nonce": cfg.nonce || "" }, credentials: "same-origin", body: JSON.stringify({ list: keep }) }).catch(function(){});
        }
        window.dispatchEvent(new CustomEvent("cbs:wishlist-change", { detail: { list: keep } }));
      });
    } catch(e) {}
  }
  function init(){
    var r = root();
    if (!r) return;
    r.addEventListener("click", onClick);
    recount();
    pruneDead();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
/* ============ /CBS-WISHLIST-PAGE-V1 ============ */


/* ===== CBS-MOBILE-HERO-V1 ===== */
/* Mobile-only hero hook (<=600px). Adapts the DESKTOP hero to a single mobile column WITHOUT
   changing its animation. The brick wall (.hero-wall) stays FULL-BLEED behind everything; only
   the "broken hole" unit -- #wallHole (with the sliding conveyor/product), the crack layers, the
   wall glow, and the debris -- is moved into a .cbs-mob-art wrapper in the .art slot so CSS can
   center + size it in the middle of the stack. The conveyor is NOT pinned (the desktop slide-
   through-the-hole animation + crack-burn cycle run unchanged, so the motion matches desktop).
   Also moves the prev/next arrows into .art and paints the active brand's flag on the 2nd button.
   No regex / no backslashes per theme-editor constraints. */
(function(){
  /* CBS-BATCH-0730 item 7: the flag painted on the mobile hero's brand button now comes from the
     SAME source of truth as everything else in the hero - window.cbsHeroStates, built server-side
     from the Customizer theme_mods. It used to come from a THIRD hardcoded brand -> country map
     right here, which still said 'beast pharm':'us' long after the Customizer was corrected to UK,
     and which had no entry at all for GASP / Better Bodies. Matching a brand by button TEXT was the
     bug: fix the data in one place and this surface never saw it. Now: match the button to its slide
     by href (then by label), read that slide's brandCountry, map it to a flag code. */
  var CC_NEEDLES = [
    ['UNITED KINGDOM','gb'], ['GREAT BRITAIN','gb'], ['ENGLAND','gb'], ['SCOTLAND','gb'], ['WALES','gb'],
    ['UNITED STATES','us'], ['AMERICA','us'],
    ['NETHERLANDS','nl'], ['SWITZERLAND','ch'], ['AUSTRALIA','au'], ['GERMANY','de'], ['ROMANIA','ro'],
    ['SWEDEN','se'], ['DENMARK','dk'], ['NORWAY','no'], ['FINLAND','fi'], ['IRELAND','ie'],
    ['POLAND','pl'], ['PORTUGAL','pt'], ['CANADA','ca'], ['FRANCE','fr'], ['ITALY','it'],
    ['SPAIN','es'], ['INDIA','in'], ['USA','us'], ['UK','gb']
  ];
  function ccFromCountry(country){
    var c = (country || '').toUpperCase();
    if (!c) return '';
    for (var i = 0; i < CC_NEEDLES.length; i++) {
      if (c.indexOf(CC_NEEDLES[i][0]) >= 0) return CC_NEEDLES[i][1];
    }
    return '';
  }
  function trimSlash(s){
    s = (s || '');
    var q = s.indexOf('?'); if (q >= 0) { s = s.substring(0, q); }
    var x = s.indexOf('#'); if (x >= 0) { s = s.substring(0, x); }
    while (s.length > 1 && s.charAt(s.length - 1) === '/') { s = s.substring(0, s.length - 1); }
    return s;
  }
  /* The slide whose secondary CTA this button currently is. The master (CBS) slide is skipped on
     purpose: its button is "Talk to us", not a brand, so it must stay flagless. */
  function stateForBtn(btn){
    var states = (window.cbsHeroStates && window.cbsHeroStates.length) ? window.cbsHeroStates : null;
    if (!states || !btn) return null;
    var href = trimSlash(btn.getAttribute('href') || '');
    var i;
    if (href) {
      for (i = 0; i < states.length; i++) {
        if (states[i].isMaster) continue;
        if (states[i].btn2Href && trimSlash(states[i].btn2Href) === href) return states[i];
      }
    }
    var txt = (btn.textContent || '').trim().toLowerCase();
    if (!txt) return null;
    for (i = 0; i < states.length; i++) {
      if (states[i].isMaster) continue;
      if ((states[i].btn2 || '').trim().toLowerCase() === txt) return states[i];
    }
    for (i = 0; i < states.length; i++) {
      if (states[i].isMaster) continue;
      var bn = (states[i].brandName || '').trim().toLowerCase();
      if (bn && txt.indexOf(bn) >= 0) return states[i];
    }
    return null;
  }
  function flagForBtn(btn){
    var st = stateForBtn(btn);
    return st ? ccFromCountry(st.brandCountry) : '';
  }
  function initCbsMobHero(){
    if (!window.matchMedia || !window.matchMedia('(max-width: 600px)').matches) return;
    var hero = document.querySelector('.cbs-hero');
    if (!hero) return;
    var art  = hero.querySelector('.art');
    var btn2 = document.getElementById('btnSecondary');
    if (!art) return;
    if (art.getAttribute('data-cbs-mob') === '1') return;
    art.setAttribute('data-cbs-mob', '1');
    // Wrap + move ONLY the broken-hole unit into .art -- the brick wall stays full-bleed where it is.
    var wrap = document.createElement('div');
    wrap.className = 'cbs-mob-art';
    wrap.setAttribute('aria-hidden', 'true');
    art.appendChild(wrap);
    // the glow lives INSIDE .hero-wall -- pull just the glow out so it centers on the hole
    var glow = hero.querySelector('.hero-wall__glow');
    if (glow && !glow.closest('.cbs-mob-art')) wrap.appendChild(glow);
    ['.hero-wall__cracks-bg-prev', '.hero-wall__cracks-bg', '.hero-wall__cracks', '.pieces'].forEach(function(sel){
      var els = hero.querySelectorAll(sel);
      for (var i = 0; i < els.length; i++) { if (!els[i].closest('.cbs-mob-art')) wrap.appendChild(els[i]); }
    });
    var hole = document.getElementById('wallHole');
    if (hole && !hole.closest('.cbs-mob-art')) wrap.appendChild(hole);
    // Move the prev/next arrows into .art (CSS flanks them around the hole).
    var rail = hero.querySelector('.cbs-hero__brand-rail-wrap');
    if (rail && !rail.closest('.art')) art.appendChild(rail);
    // Brand-button flag, read from the button text.
    function syncFlag(){
      if (!btn2) return;
      var cc = flagForBtn(btn2);
      if (cc) { btn2.style.backgroundImage = 'url(/cbs/live/assets/flags/' + cc + '.svg)'; btn2.classList.add('cbs-has-flag'); }
      else    { btn2.style.backgroundImage = ''; btn2.classList.remove('cbs-has-flag'); }
    }
    syncFlag();
    if (btn2) { try { new MutationObserver(syncFlag).observe(btn2, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href'] }); } catch (e) {} }
    // No GSAP pop and the conveyor is no longer pinned by CSS -- the product slides through the
    // hole via the desktop conveyor animation (identical motion to desktop), so nothing else here.
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(initCbsMobHero, 350); });
  } else {
    setTimeout(initCbsMobHero, 350);
  }
})();
/* ===== /CBS-MOBILE-HERO-V1 ===== */

/* ============ CBS-CARD-ADDCART-V1 — product-card "ADD TO CART" CTA ============
   Variable products open the variation-aware popup (cbsWishPopup, 'cart' mode);
   simple products add directly via cbsWishPopup.addToCart (applies .cart-count
   fragment + toast). Clicking anywhere else on the card still goes to the PDP. */
(function(){
  /* CBS-AUDIT-0804: delegates to the shared CBS-FLASH-V1 helper (was the second of two
     near-duplicate implementations). Its data-orig capture is what the shared helper uses. */
  function flash(btn, html){
    if (window.cbsFlash) { window.cbsFlash(btn, html); return; }
    var orig = btn.getAttribute("data-orig");
    if (orig === null) { btn.setAttribute("data-orig", btn.innerHTML); orig = btn.innerHTML; }
    btn.innerHTML = html;
    btn.classList.add("is-done");
    setTimeout(function(){ btn.innerHTML = btn.getAttribute("data-orig") || orig; btn.classList.remove("is-done"); }, 1700);
  }
  document.addEventListener("click", function(e){
    var btn = e.target.closest && e.target.closest(".cbs-card__addcart");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var pid = btn.getAttribute("data-product-id");
    var pop = window.cbsWishPopup;
    if (btn.getAttribute("data-variable") === "1") {
      if (pop && pop.open) { pop.open(pid, "cart"); }
      else { window.location.href = btn.getAttribute("data-href"); }
      return;
    }
    /* simple product: add straight to cart */
    if (!pop || !pop.addToCart) { window.location.href = btn.getAttribute("data-href"); return; }
    if (btn.classList.contains("is-busy")) return;
    btn.classList.add("is-busy");
    pop.addToCart(pid, 0, null).then(function(res){
      btn.classList.remove("is-busy");
      if (res && res.ok) {
        flash(btn, '<span class="cbs-card__cta-l">ADDED</span><span class="cbs-card__cta-arr"><i class="ph-bold ph-check"></i></span>');
      }
    });
  });
})();
/* ============ /CBS-CARD-ADDCART-V1 ============ */


/* ===== CBS-TRUST-FLIP (2026-07-15 / SCROLL-STEP) — mobile: the 4 Integrity cards flip as you
   SCROLL through the pinned section, but the flip STEPS exactly one card at a time and NEVER skips,
   no matter how fast/hard you scroll (scroll position picks a target; the flip animates one card at a
   time toward it). Scroll up steps back. Dots = passive progress. Desktop keeps the normal list. ===== */
(function(){
  function mk(t,c){ var e=document.createElement(t); if(c) e.className=c; return e; }
  function init(){
    try{
      if(!(window.matchMedia && window.matchMedia('(max-width:767px)').matches)) return;
      var section=document.querySelector('.cbs-home__trust');
      if(!section || section.getAttribute('data-tflip')==='1') return;
      var header=section.querySelector('.cbs-container');
      var list=section.querySelector('.cbs-trust__list');
      if(!header || !list) return;
      var rows=Array.prototype.slice.call(list.querySelectorAll('.cbs-trust__row'));
      if(rows.length<2) return;
      var N=rows.length;
      var cards=rows.map(function(r){ return r.innerHTML; });

      var pin=mk('div','cbs-trust__pin'), flip=mk('div','cbs-tflip'), card=mk('div','cbs-tflip__card');
      var front=mk('div','cbs-tflip__face cbs-tflip__face--front cbs-trust__row');
      var back=mk('div','cbs-tflip__face cbs-tflip__face--back cbs-trust__row');
      front.innerHTML=cards[0]; back.innerHTML=cards[1]||cards[0];
      card.appendChild(front); card.appendChild(back); flip.appendChild(card);
      var dots=mk('div','cbs-tflip__dots');
      for(var i=0;i<N;i++){ dots.appendChild(mk('span','cbs-tflip__dot'+(i===0?' is-on':''))); }
      section.insertBefore(pin, header);
      /* CBS-TFLIP-NODOTS (2026-08-02): the dots are NOT appended any more. They read as carousel
         controls, which is exactly the wrong signal for a section driven by scroll/swipe - and
         that misread is what testers tripped over. `dots` stays constructed but detached so
         paintDots() below carries on writing to it harmlessly, rather than needing edits
         threaded through this block. Removing them before relayout() also means the pin height
         it measures is the real one. */
      pin.appendChild(header); pin.appendChild(flip);
      section.setAttribute('data-tflip','1');
      /* explicit contract for CBS-SWIPE-ASSIST, which can no longer count dots to learn N */
      section.setAttribute('data-tflip-n', String(N));

      /* CBS-TRUST-SCROLL2 (2026-07-15): SCROLL-driven flip that steps EXACTLY ONE card per scroll
         segment and NEVER skips, no matter how fast/hard you scroll. The section is pinned over a
         runway; scroll position picks a target card, but the flip animates ONE card at a time toward
         it (queued), so every claim shows in order. Scroll up steps back one at a time. */
      var PIN = 58, cur = 0, target = 0, animating = false;
      function faceFor(i){ return (i % 2 === 0) ? front : back; }
      function paintDots(){ for(var k=0;k<dots.children.length;k++){ dots.children[k].className='cbs-tflip__dot'+(k===cur?' is-on':''); } }
      function stepToward(){
        if(animating || cur === target) return;
        animating = true;
        var next = cur + (target > cur ? 1 : -1);
        faceFor(next).innerHTML = cards[next];
        card.style.transition = '';
        card.style.transform = 'rotateX(' + (next*180) + 'deg)';
        cur = next; paintDots();
        setTimeout(function(){ animating = false; stepToward(); }, 480);
      }
      section.__tflipShow = function(k){ if(k<0)k=0; if(k>N-1)k=N-1; target=k; stepToward(); };
      function travel(){ return N * Math.max(300, Math.round((window.innerHeight||700) * 0.58)); }
      function relayout(){ section.style.minHeight = (pin.offsetHeight + travel()) + 'px'; }
      function onScroll(){
        var top = section.getBoundingClientRect().top;
        var p = (PIN - top) / travel();
        if(p<0)p=0; if(p>1)p=1;
        var t = Math.floor(p * N); if(t>N-1) t=N-1;
        if(t !== target){ target = t; stepToward(); }
      }
      relayout(); onScroll();
      var tflipRaf=0;
      window.addEventListener('scroll', function(){ if(tflipRaf) return; tflipRaf=requestAnimationFrame(function(){ tflipRaf=0; onScroll(); }); }, {passive:true});
      /* CBS-TRUST-RESIZE-FIX (2026-07-25): the mobile URL bar shows/hides on every change of
         scroll DIRECTION, which fires a HEIGHT-ONLY resize. relayout() derives the section's
         min-height from window.innerHeight (travel() = N * 0.58vh), so re-running it there
         rewrote this section's height mid-scroll and shoved everything below it - the visible
         JUMP in the brands section and further down. Only re-lay-out on a real WIDTH change
         (resize / rotation); still re-run onScroll() so the flip keeps tracking. Same guard as
         CBS-STACK-DECK-FIX. */
      var tflipLastW = window.innerWidth;
      window.addEventListener('resize', function(){
        var w = window.innerWidth;
        if(w === tflipLastW){ onScroll(); return; }
        tflipLastW = w;
        relayout(); onScroll();
      }, { passive: true });
      window.addEventListener('orientationchange', function(){
        tflipLastW = window.innerWidth;
        setTimeout(function(){ relayout(); onScroll(); }, 320);
      }, { passive: true });

      try{
        var io=new IntersectionObserver(function(ents){ ents.forEach(function(x){ if(x.isIntersecting){ flip.classList.add('is-in'); io.disconnect(); } }); }, {threshold:0.3});
        io.observe(flip);
      }catch(e){ flip.classList.add('is-in'); }
    }catch(e){}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(init,150); });
  else setTimeout(init,150);
})();
/* ===== End CBS-TRUST-FLIP JS ===== */

/* ===== CBS-STACK-DECK (2026-07-10) - MOBILE PRE-BUILT STACKS deck: the 4 stack tiles are pinned by CSS
   sticky (see the CBS-STACK-DECK style.css block); this drives the per-layer scale-down so every card
   already in the pile shrinks a notch each time a newer card lands on top of it (deepest = smallest).
   Pure scroll-position math (no getBoundingClientRect per frame), run in a rAF loop that is only alive
   while the deck is on screen. It also appends a trailing SPACER inside the grid: position:sticky is
   confined to its containing block's CONTENT box (padding does NOT count), so without real content after
   the last card, card 4 can never rest - the spacer is the scroll runway that holds the assembled deck
   before it releases. <=767 only; desktop / reduced-motion keep the plain grid (no scale). ===== */
(function(){
  var MQ = '(max-width:767px)';
  var STEP = 0.05;        // scale-down per stacked layer (card3=1.0, card2=.95, card1=.90, card0=.85)
  var MINSCALE = 0.82;    // floor
  var TRANS = 170;        // px window over which a landing card's "depth" ramps 0 -> 1 (smoothness)

  var section, grid, cards = [], N = 0, spacer = null, active = false, raf = 0, lastY = -1, reduce = false;

  function mm(){ return !!(window.matchMedia && window.matchMedia(MQ).matches); }
  function scrollY(){ return window.pageYOffset || document.documentElement.scrollTop || 0; }

  function measure(){
    if(!grid || !N) return;
    // pin offset: just below the fixed corner nav pill
    var navOff = 100;
    var pill = document.querySelector('.cbs-nav__corner');
    if(pill){
      var pr = pill.getBoundingClientRect();
      if(pr.height > 0 && pr.bottom > 0) navOff = Math.round(pr.bottom + 14);
    }
    // peek: card top -> just below its title row (number + name). Kept tight so only "01 TITLE" shows
    // (the VARIATIONS/LEVEL meta sits below the fold and is covered when the card is stacked).
    var peek = 66;
    var c0 = cards[0];
    var title = c0.querySelector('.cbs-stack-tile__title') || c0.querySelector('.cbs-stack-tile__hd');
    if(title){
      var cr = c0.getBoundingClientRect(), tr = title.getBoundingClientRect();
      peek = Math.round((tr.bottom - cr.top) + 6);
    }
    if(peek < 46) peek = 46; else if(peek > 120) peek = 120;

    grid.style.setProperty('--cbs-deck-top', navOff + 'px');
    grid.style.setProperty('--cbs-deck-peek', peek + 'px');

    // RUNWAY: real trailing content so the last card can rest + the assembled deck holds a beat.
    // (padding-bottom does NOT work: sticky is confined to the containing block's content box.)
    var hold = Math.round(window.innerHeight * 0.30);
    if(hold < 180) hold = 180; else if(hold > 300) hold = 300;
    if(spacer){ spacer.style.display = 'block'; spacer.style.height = hold + 'px'; }
    grid.style.setProperty('padding-bottom', '0px', 'important');  // neutralise the CSS 26vh (spacer replaces it)

    // each card's landing scroll position = its natural document top minus its resting viewport top.
    // natural tops are built from cumulative offsetHeight (unaffected by sticky OR by transform:scale).
    var gridTopDoc = grid.getBoundingClientRect().top + scrollY();
    var acc = gridTopDoc, i;
    for(i = 0; i < N; i++){
      cards[i]._restY = acc - (navOff + i * peek);
      var cs = window.getComputedStyle(cards[i]);
      var mb = parseFloat(cs.marginBottom) || 0;
      acc += cards[i].offsetHeight + mb;
    }
    section.__deckPeek = peek; section.__deckTop = navOff; section.__deckHold = hold;   // probe hooks
  }

  function apply(){
    var y = scrollY(), i, j;
    for(i = 0; i < N; i++){
      if(cards[i]._restY == null){ continue; }
      var depth = 0;
      for(j = i + 1; j < N; j++){
        if(cards[j]._restY == null) continue;
        var f = (y - (cards[j]._restY - TRANS)) / TRANS;   // 0 far above, 1 once card j has landed
        if(f < 0) f = 0; else if(f > 1) f = 1;
        depth += f;
      }
      var s = 1 - STEP * depth;
      if(s < MINSCALE) s = MINSCALE;
      cards[i].style.setProperty('--deck-scale', s.toFixed(4));
    }
  }

  function loop(){
    if(!active) return;
    var y = scrollY();
    if(y !== lastY){ lastY = y; apply(); }
    raf = window.requestAnimationFrame(loop);
  }
  function start(){ if(active || reduce) return; active = true; lastY = -1; raf = window.requestAnimationFrame(loop); }
  function stop(){ active = false; if(raf){ window.cancelAnimationFrame(raf); raf = 0; } }
  function clearScales(){ for(var i = 0; i < N; i++){ cards[i].style.removeProperty('--deck-scale'); } }

  function refresh(){
    if(!mm()){                                   // desktop: undo everything, restore the grid
      stop(); clearScales();
      if(spacer) spacer.style.display = 'none';
      grid.style.removeProperty('padding-bottom');
      return;
    }
    measure();                                   // mobile (incl. reduced-motion): build the pile geometry
    if(reduce){ stop(); clearScales(); }         // reduced-motion: sticky pile only, no scale animation
    else apply();
  }

  function setup(){
    section = document.querySelector('.cbs-home__stack');
    if(!section) return;
    grid = section.querySelector('.cbs-home__stack-grid');
    if(!grid) return;
    cards = Array.prototype.slice.call(grid.querySelectorAll(':scope > .cbs-stack-tile'));
    N = cards.length;
    if(N < 2) return;
    reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    if(!grid.querySelector('.cbs-deck-spacer')){
      spacer = document.createElement('div');
      spacer.className = 'cbs-deck-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      spacer.style.cssText = 'display:none;width:100%;pointer-events:none;';
      grid.appendChild(spacer);
    } else { spacer = grid.querySelector('.cbs-deck-spacer'); }

    refresh();

    try{
      var io = new IntersectionObserver(function(ents){
        for(var k = 0; k < ents.length; k++){
          if(ents[k].isIntersecting){ if(mm() && !reduce) start(); }
          else stop();
        }
      }, { rootMargin: '140px 0px 140px 0px', threshold: 0 });
      io.observe(section);
    }catch(e){ if(mm() && !reduce) start(); }

    var rt, lastW = window.innerWidth;
    /* CBS-STACK-DECK-FIX (2026-07-15): the mobile URL/toolbar show/hide fires a HEIGHT-ONLY resize on
       every scroll; re-measuring there re-lays-out the pinned pile mid-scroll and is what caused the
       visible JUMP entering/leaving the section. Only re-measure when the WIDTH actually changes
       (a real resize / rotation) so toolbar height changes no longer disturb the deck. */
    window.addEventListener('resize', function(){
      var w = window.innerWidth;
      if(w === lastW) return;
      lastW = w;
      clearTimeout(rt); rt = setTimeout(refresh, 160);
    }, { passive: true });
    window.addEventListener('orientationchange', function(){ lastW = window.innerWidth; setTimeout(refresh, 320); }, { passive: true });
    window.addEventListener('load', function(){ setTimeout(refresh, 220); });
    if(document.fonts && document.fonts.ready && document.fonts.ready.then){
      document.fonts.ready.then(function(){ setTimeout(refresh, 60); });
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(setup, 120); });
  else setTimeout(setup, 120);
})();
/* ===== End CBS-STACK-DECK JS ===== */

/* ===== CBS-REVEAL (2026-07-15) — cohesive scroll-in reveal for home sections (mobile). Adds
   .cbs-reveal (fade + rise) to the content sections and reveals them via IntersectionObserver as
   they enter. The sticky Stacks section gets .cbs-reveal--fade (opacity only) so no ancestor
   transform can break its pile. Sections already in view at load are revealed synchronously (no
   flash / no hidden above-fold content). <=767 + no reduced-motion only; desktop untouched. ===== */
(function(){
  try{
    if(!(window.matchMedia && window.matchMedia('(max-width:767px)').matches)) return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    function run(){
      /* CBS-REVEAL-FIX (2026-07-15): DON'T reveal the carousel/brands sections — their product
         grids are 13000-26000px wide, and a transform on that subtree promotes a giant GPU layer
         that crashes mobile Safari (tab reload past the brands section). Light sections only. */
      var sel = '.cbs-home__trust, .cbs-home__stack, .cbs-home__crew, .cbs-home__ath, .cbs-home__blog';
      var sections = Array.prototype.slice.call(document.querySelectorAll(sel));
      if(!sections.length) return;
      sections.forEach(function(s){
        s.classList.add('cbs-reveal');
        if(s.classList.contains('cbs-home__stack') || s.classList.contains('cbs-home__trust')) s.classList.add('cbs-reveal--fade');
      });
      var vh = window.innerHeight || 700;
      function reveal(s){ s.classList.add('is-in'); }
      sections.forEach(function(s){ var r = s.getBoundingClientRect(); if(r.top < vh * 0.85) reveal(s); });
      if('IntersectionObserver' in window){
        var io = new IntersectionObserver(function(ents){
          ents.forEach(function(e){ if(e.isIntersecting){ reveal(e.target); io.unobserve(e.target); } });
        }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
        sections.forEach(function(s){ if(!s.classList.contains('is-in')) io.observe(s); });
      } else {
        sections.forEach(reveal);
      }
    }
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  }catch(e){}
})();
/* ===== End CBS-REVEAL JS ===== */


/* ===== CBS-BRANDS-FLAG (2026-07-10 v2 eased) - MOBILE Shop-by-Brand flag reveal: each brand stamp's
   country flag (::before) fades IN as its centre nears the viewport centre and OUT as it moves away,
   driven per-frame by --cbs-flag-op with a smoothstep distance falloff. Continuous (no binary toggle,
   no gap-blink) so scrolling is smooth, not flickery. rAF loop, only alive while the section is on
   screen. <=767 only; desktop keeps its :hover reveal. Pairs with the CBS-BRANDS-MOB-2UP style block. ===== */
(function(){
  var MQ = '(max-width:767px)';
  var chips = [], active = false, raf = 0, lastY = -1, lastH = -1;
  function mm(){ return !!(window.matchMedia && window.matchMedia(MQ).matches); }
  function scrollY(){ return window.pageYOffset || document.documentElement.scrollTop || 0; }

  function apply(){
    var cy = window.innerHeight / 2, i, r, mid, R, d, t, op;
    for(i = 0; i < chips.length; i++){
      r = chips[i].getBoundingClientRect();
      mid = (r.top + r.bottom) / 2;
      R = (r.bottom - r.top) * 1.15 + 10;          // falloff radius ~ one stamp height
      if(R < 90) R = 90;
      d = Math.abs(mid - cy);
      t = 1 - d / R; if(t < 0) t = 0; else if(t > 1) t = 1;
      op = t * t * (3 - 2 * t);                      // smoothstep easing
      if(Math.abs(op - (chips[i].__op || 0)) > 0.004){
        chips[i].__op = op;
        chips[i].style.setProperty('--cbs-flag-op', op.toFixed(3));
      }
    }
  }
  function loop(){
    if(!active) return;
    var y = scrollY(), h = window.innerHeight;
    if(y !== lastY || h !== lastH){ lastY = y; lastH = h; apply(); }
    raf = window.requestAnimationFrame(loop);
  }
  function start(){ if(active || !mm()) return; active = true; lastY = -1; lastH = -1; raf = window.requestAnimationFrame(loop); }
  function stop(){ active = false; if(raf){ window.cancelAnimationFrame(raf); raf = 0; } }
  function clearAll(){ for(var i = 0; i < chips.length; i++){ chips[i].style.removeProperty('--cbs-flag-op'); chips[i].__op = 0; } }

  function setup(){
    var rail = document.querySelector('.cbs-home__brand-rail');
    if(!rail) return;
    chips = Array.prototype.slice.call(rail.querySelectorAll('.cbs-brand-chip'));
    if(!chips.length) return;
    var sec = document.querySelector('.cbs-home__brands') || rail;
    try{
      var io = new IntersectionObserver(function(ents){
        for(var k = 0; k < ents.length; k++){
          if(ents[k].isIntersecting && mm()){ start(); apply(); }
          else stop();
        }
      }, { rootMargin: '120px 0px 120px 0px', threshold: 0 });
      io.observe(sec);
    }catch(e){ if(mm()){ start(); apply(); } }
    window.addEventListener('resize', function(){ if(!mm()){ stop(); clearAll(); } else { start(); apply(); } }, { passive: true });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(setup, 140); });
  else setTimeout(setup, 140);
})();
/* ===== End CBS-BRANDS-FLAG JS ===== */




/* ===== CBS-CAROUSEL-MOB-CENTER (2026-07-10) - MOBILE single-card centre-snap carousel for Dress-the-Part
   + Top-Movers: working Prev/Next arrows + AUTO-SCROLL (advance one card, ~1s stop, advance...) that runs
   until the user interacts (taps an arrow, swipes the cards, or taps a card), then stops permanently.
   The auto step uses scrollBy(stride) so the CSS mandatory centre-snap parks each card dead-centre. A
   capture-phase click listener on the CAROUSEL stops arrow clicks before the legacy CBS-CAROUSEL-V14
   boost handler runs. Auto only runs while the carousel is on screen; ambient drift is already 0 on
   mobile (V14 DRIFT_VEL patch). <=767 only; honours prefers-reduced-motion (no auto). ===== */
(function(){
  var MQ = '(max-width:767px)';
  var STOP_MS = 1000, MOVE_FALLBACK = 750, START_DELAY = 1200;
  function mm(){ return !!(window.matchMedia && window.matchMedia(MQ).matches); }
  function reduced(){ return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  function setup(carousel){
    if(carousel.__cbsMobCtr) return;
    var grid = carousel.querySelector('.cbs-prod-grid');
    if(!grid) return;
    carousel.__cbsMobCtr = 1;

    function stride(){
      var it = grid.querySelector('.cbs-prod-item:not(.is-hidden)');
      var g = parseFloat(getComputedStyle(grid).columnGap) || parseFloat(getComputedStyle(grid).gap) || 14;
      return it ? Math.round(it.getBoundingClientRect().width + g) : Math.round(grid.clientWidth * 0.82);
    }
    function updArrows(){
      var prev = carousel.querySelector('.cbs-prod-arrow--prev'), next = carousel.querySelector('.cbs-prod-arrow--next');
      var max = grid.scrollWidth - grid.clientWidth - 2;
      if(prev) prev.disabled = grid.scrollLeft <= 2;
      if(next) next.disabled = grid.scrollLeft >= max;
    }
    function go(dir){ if(!mm()) return; grid.scrollBy({ left: dir * stride(), behavior: 'smooth' }); }

    /* ---- AUTO-SCROLL (advance one card, ~1s stop, repeat) until interacted ---- */
    var A = { running: false, took: false, timer: 0, inView: false, dir: 1 };
    function moveNext(){
      var max = grid.scrollWidth - grid.clientWidth - 4;
      if(A.dir > 0 && grid.scrollLeft >= max) A.dir = -1;          // reached the end -> ping-pong back
      else if(A.dir < 0 && grid.scrollLeft <= 4) A.dir = 1;
      grid.scrollBy({ left: A.dir * stride(), behavior: 'smooth' });
    }
    function step(){
      if(A.took || !A.inView || !mm() || reduced()){ A.running = false; return; }
      moveNext();
      var done = false;
      function onEnd(){ if(done) return; done = true; grid.removeEventListener('scrollend', onEnd); clearTimeout(fb); if(A.running && !A.took) A.timer = setTimeout(step, STOP_MS); }
      var fb = setTimeout(onEnd, MOVE_FALLBACK);           // fallback if scrollend is unsupported/misses
      grid.addEventListener('scrollend', onEnd);
    }
    function startAuto(){ if(A.took || A.running || !A.inView || !mm() || reduced()) return; A.running = true; A.timer = setTimeout(step, START_DELAY); }
    function pauseAuto(){ A.running = false; clearTimeout(A.timer); A.timer = 0; }
    function takeOver(){ A.took = true; pauseAuto(); }

    /* arrows: capture on the CAROUSEL so V14's boost handler (on the arrow) never fires */
    carousel.addEventListener('click', function(e){
      if(!mm()) return;
      var t = e.target, next = t.closest && t.closest('.cbs-prod-arrow--next'), prev = t.closest && t.closest('.cbs-prod-arrow--prev');
      if(next || prev){ e.preventDefault(); e.stopImmediatePropagation(); takeOver(); go(next ? 1 : -1); return; }
      takeOver();                                          // tapping a card / its buttons = interaction
    }, true);

    /* a deliberate HORIZONTAL swipe on the cards = interaction (a vertical page-scroll is ignored) */
    var sx = 0, sy = 0, tracking = false;
    grid.addEventListener('touchstart', function(e){ if(!mm()) return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true; }, { passive: true });
    grid.addEventListener('touchmove', function(e){
      if(!tracking || !mm()) return;
      var dx = Math.abs(e.touches[0].clientX - sx), dy = Math.abs(e.touches[0].clientY - sy);
      if(dx > 10 && dx > dy){ tracking = false; takeOver(); }   // horizontal -> carousel swipe
      else if(dy > 12){ tracking = false; }                     // vertical -> page scroll, leave auto on
    }, { passive: true });
    grid.addEventListener('touchend', function(){ tracking = false; }, { passive: true });

    grid.addEventListener('scroll', function(){ if(mm()) updArrows(); }, { passive: true });

    var section = carousel.closest('section');
    if(section){
      Array.prototype.slice.call(section.querySelectorAll('.cbs-tab')).forEach(function(tb){
        tb.addEventListener('click', function(){ setTimeout(function(){ if(mm()){ grid.scrollLeft = 0; A.dir = 1; updArrows(); } }, 240); });
      });
    }

    try{
      var io = new IntersectionObserver(function(e){ A.inView = !!(e[0] && e[0].isIntersecting); if(A.inView) startAuto(); else pauseAuto(); }, { threshold: 0.35 });
      io.observe(carousel);
    }catch(e){ A.inView = true; startAuto(); }

    setTimeout(updArrows, 120);
  }

  function init(){ if(!mm()) return; Array.prototype.slice.call(document.querySelectorAll('.cbs-prod-carousel')).forEach(setup); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 400); });
  else setTimeout(init, 400);
  window.addEventListener('load', function(){ setTimeout(init, 300); });
})();
/* ===== End CBS-CAROUSEL-MOB-CENTER JS ===== */


/* ===== CBS-NAV-CORNER-UP (2026-07-10) - MOBILE header nav (corner pill) auto-hide: hides on scroll-down
   and only reappears on a swipe-UP (or when back near the top). The theme's inline nav script re-shows
   the pill whenever scrolling STOPS (a 200ms timer removing .is-hidden); this holds a separate
   .cbs-nav-corner-away class on the pill so it stays hidden past that stop and lifts only on an upward
   gesture. rAF-throttled. <=767 only. ===== */
(function(){
  var MQ = '(max-width:767px)';
  function mm(){ return !!(window.matchMedia && window.matchMedia(MQ).matches); }
  function sy(){ return window.pageYOffset || document.documentElement.scrollTop || 0; }
  var lastY = sy(), acc = 0, raf = 0;
  var TOP = 44,          // at/above this scroll position the pill is always shown
      UP_TH = 6,         // an upward gesture bigger than this reveals the pill
      DOWN_HIDE = 30;    // hide once a downward gesture has covered this much

  function corner(){ return document.querySelector('.cbs-nav__corner'); }
  function busy(){
    var n = document.querySelector('[data-cbs-nav]');
    return !!(n && (n.classList.contains('is-mobile-open') || n.classList.contains('is-searching') || n.classList.contains('is-shop')));
  }
  function apply(){
    raf = 0;
    var c = corner(); if(!c) return;
    if(!mm()){ c.classList.remove('cbs-nav-corner-away'); return; }
    var y = sy(), dy = y - lastY; lastY = y;
    if(busy() || y <= TOP){ acc = 0; c.classList.remove('cbs-nav-corner-away'); return; }
    if(dy > 0){ acc += dy; if(acc > DOWN_HIDE) c.classList.add('cbs-nav-corner-away'); }   // scrolling down -> hide
    else if(dy < -UP_TH){ acc = 0; c.classList.remove('cbs-nav-corner-away'); }            // swipe up -> show
  }
  function onScroll(){ if(!raf) raf = window.requestAnimationFrame(apply); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function(){ var c = corner(); if(c && !mm()) c.classList.remove('cbs-nav-corner-away'); }, { passive: true });
})();
/* ===== End CBS-NAV-CORNER-UP JS ===== */


/* ===== CBS-CART-STICKYBAR-V1 JS (2026-07-11) — inject the "View details" toggle into the cart's
   Order Summary and expand/collapse the sticky bottom sheet. Re-injects after the cart AJAX swap
   (cbs:cart:changed) since the summary lives inside the swapped .cbs-cart__live. Delegated click so
   it survives swaps. Desktop: the toggle is display:none via CSS. ===== */
(function(){
  function totalHTML(){
    var dd=document.querySelector('.cbs-cart__fare .cbs-cart__line-row--total dd');
    return dd ? dd.innerHTML : '';
  }
  function inject(){
    var fare=document.querySelector('.cbs-cart .cbs-cart__fare');
    if(!fare) return;
    var html='<span class="cbs-fare-toggle__lbl"><span class="cbs-fare-toggle__chev"><i class="ph-bold ph-caret-up" aria-hidden="true"></i></span> View details</span>'+
             '<span class="cbs-fare-toggle__tot"><span>Total</span> <b>'+totalHTML()+'</b></span>';
    var ex=fare.querySelector('.cbs-fare-toggle');
    if(ex){ ex.innerHTML=html; return; }
    var btn=document.createElement('button');
    btn.type='button'; btn.className='cbs-fare-toggle'; btn.setAttribute('aria-expanded','false');
    btn.innerHTML=html;
    fare.insertBefore(btn, fare.firstChild);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', inject); else inject();
  document.addEventListener('cbs:cart:changed', function(){ setTimeout(inject, 90); });
  document.addEventListener('click', function(e){
    var t=e.target.closest ? e.target.closest('.cbs-fare-toggle') : null;
    if(!t) return;
    var cart=document.querySelector('.cbs-cart'); if(!cart) return;
    var open=cart.classList.toggle('is-fare-open');
    t.setAttribute('aria-expanded', open?'true':'false');
  });
})();
/* ===== End CBS-CART-STICKYBAR-V1 JS ===== */


/* ===== CBS-CART-VVFIX (2026-07-11) — iOS Safari: position:fixed;bottom:0 is anchored to the LAYOUT
   viewport, so when Safari's bottom toolbar shows/hides the sticky cart summary floats off the true
   (visual) bottom and page content peeks through below it (a background filler can't help — iOS clips
   fixed content to the layout viewport). Glue the summary to the VISUAL viewport bottom with a
   translateY driven by the VisualViewport API. Self-correcting in both directions; no-op off-iOS
   (visual==layout -> translateY(0)). <=680 + cart only. ===== */
(function(){
  var vv = window.visualViewport;
  if(!vv) return;
  var raf = 0;
  function apply(){
    raf = 0;
    var sum = document.querySelector('.cbs-cart .cbs-cart__summary');
    if(!sum) return;
    if(!(window.matchMedia && window.matchMedia('(max-width:680px)').matches)){ sum.style.transform = ''; return; }
    var off = window.innerHeight - vv.height - vv.offsetTop;   // >0: bar below visual bottom; <0: above it
    sum.style.transform = 'translateY(' + (-Math.round(off)) + 'px)';
  }
  function sched(){ if(raf) return; raf = requestAnimationFrame(apply); }
  vv.addEventListener('resize', sched);
  vv.addEventListener('scroll', sched);
  window.addEventListener('scroll', sched, {passive:true});
  window.addEventListener('orientationchange', function(){ setTimeout(apply, 300); });
  document.addEventListener('cbs:cart:changed', function(){ setTimeout(apply, 120); });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();
/* ===== End CBS-CART-VVFIX ===== */

/* ===== CBS-QA-FIX m10-pdp-notify (2026-07-18): out-of-stock product pages get a working
   Notify Me control (reuses the CBS-NOTIFY-V1 restock modal via window.cbsNotifyOpen) and the
   buy controls are visibly disabled so they no longer read as actionable. Unifies the variable
   (Assassin V9) and simple (Prime Years Stack) out-of-stock buy boxes. ===== */
(function(){
  function initCbsPdpNotify(){
    var art = document.querySelector('article.cbs-prod[data-pid]');
    if (!art) return;
    var buy = art.querySelector('.cbs-pv-buy');
    if (!buy) return;
    var oos = art.querySelector('.cbs-pv-stock.is-out') || buy.querySelector('.stock.out-of-stock');
    if (!oos) return;
    if (buy.querySelector('.cbs-pv-notify')) return;
    buy.classList.add('cbs-pv-buy--oos');
    var pid = art.getAttribute('data-pid') || '';
    var t = document.querySelector('.cbs-pv-title, .product_title');
    var pname = t ? t.textContent.trim() : '';
    var wrap = document.createElement('div');
    wrap.className = 'cbs-pv-notify';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cbs-pv-notify__btn';
    btn.innerHTML = '<i class="ph-bold ph-bell-ringing" aria-hidden="true"></i><span>NOTIFY ME WHEN BACK</span>';
    btn.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      if (window.cbsNotifyOpen) { window.cbsNotifyOpen(pid, pname); }
    });
    wrap.appendChild(btn);
    var anchor = buy.querySelector('.stock.out-of-stock');
    if (anchor && anchor.parentNode) { anchor.parentNode.insertBefore(wrap, anchor); }
    else { buy.insertBefore(wrap, buy.firstChild); }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function(){ setTimeout(initCbsPdpNotify, 150); }); }
  else { setTimeout(initCbsPdpNotify, 150); }
})();


/* ===== CBS-NAV-DIM (2026-07-25) - the MOBILE header pill no longer hides on scroll; CSS now
   dims it to 52% for both former hide states (.is-hidden and .cbs-nav-corner-away) and leaves
   it in place, still tappable. This adds the "wake on touch" half: touching the pill puts it
   back to full opacity for a few seconds. Scrolling back near the top, or opening the
   menu/search/shop drawer, already restores it - the two existing scroll scripts drop their
   class in those states. <=767 only; desktop untouched. ===== */
(function(){
  var MQ = '(max-width:767px)';
  var AWAKE_MS = 2600;
  var t = 0;
  function mm(){ return !!(window.matchMedia && window.matchMedia(MQ).matches); }
  function corner(){ return document.querySelector('.cbs-nav__corner'); }
  function wake(){
    var c = corner();
    if ( !c || !mm() ) { return; }
    c.classList.add('is-awake');
    clearTimeout(t);
    t = setTimeout(function(){ c.classList.remove('is-awake'); }, AWAKE_MS);
  }
  function hit(e){
    var c = corner();
    if ( c && e.target && c.contains(e.target) ) { wake(); }
  }
  document.addEventListener('pointerdown', hit, { passive: true });
  document.addEventListener('touchstart',  hit, { passive: true });
  document.addEventListener('focusin',     hit, { passive: true });
})();
/* ===== End CBS-NAV-DIM JS ===== */

/* ============ CBS-AUDIT-FIX-01 (2026-07-27) - sync .is-zero on nav count badges ============
   header.php inline nav script calls setWish() on load but only calls setCart() from cart
   EVENTS (added_to_cart / removed_from_cart / wc_fragments_refreshed), never at first paint.
   So a fresh load with an empty cart left the cart bubble showing a full-size "0" sitting on
   top of the bag glyph (it only hid after you added then removed an item). Keep both badges
   .is-zero flag in sync with their own text, on load and on any later change.
   CSS half lives in style.css under the same marker. */
(function () {
  function sync(el) {
    if (!el) return;
    var n = parseInt((el.textContent || "").trim(), 10);
    if (isNaN(n)) n = 0;
    el.classList.toggle("is-zero", n === 0);
  }
  function syncAll() {
    var els = document.querySelectorAll(".cbs-nav__util-count");
    for (var i = 0; i < els.length; i++) sync(els[i]);
  }
  function init() {
    syncAll();
    var host = document.querySelector(".cbs-nav__util");
    if (host && window.MutationObserver) {
      /* observe TEXT only - we mutate class, so this cannot feed back into itself */
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var t = muts[i].target;
          var el = (t.nodeType === 1 ? t : t.parentElement);
          if (el && el.closest) {
            var c = el.closest(".cbs-nav__util-count");
            if (c) sync(c);
          }
        }
      }).observe(host, { childList: true, characterData: true, subtree: true });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("load", syncAll);
})();
/* ============ /CBS-AUDIT-FIX-01 ============ */

/* ============ CBS-PERF-08 (2026-07-27) - carousel pre-warm ============
   functions.php now marks off-screen attachment images loading="lazy", which cut the
   homepage from 193 requests / 7.4MB to 65 / 3.8MB. But the product carousels scroll
   HORIZONTALLY: their later cards sit thousands of px to the right, far outside the
   browser lazy threshold, so only ~2 of 38 images were fetched and swiping could show
   empty cards on a slow connection. That would be a visible behaviour change.
   Fix: when a carousel comes within 600px of the viewport, promote ALL of its images
   back to eager so they are already there by the time the user can swipe. Sections the
   visitor never scrolls to still cost nothing - which is where the saving actually was. */
(function () {
  if (!("IntersectionObserver" in window)) return;
  var SEL = ".cbs-prod-grid, .cbs-prod-carousel, .cbs-mswipe, .cbs-stack-deck, .cbs-brands__grid";
  function warm(el) {
    var imgs = el.querySelectorAll('img[loading="lazy"]');
    for (var i = 0; i < imgs.length; i++) imgs[i].loading = "eager";
  }
  function init() {
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (!e.isIntersecting) continue;
        warm(e.target);
        /* carousels clone their slides with JS; re-run once so clones are covered too */
        (function (t) { setTimeout(function () { warm(t); }, 900); })(e.target);
        io.unobserve(e.target);
      }
    }, { rootMargin: "600px 0px" });
    var els = document.querySelectorAll(SEL);
    for (var i = 0; i < els.length; i++) io.observe(els[i]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
/* ============ /CBS-PERF-08 ============ */

/* ============ CBS-FIX-04 (2026-07-29) - search suggestion chips closed the sheet ============
   Tapping a POPULAR/recent chip in the mobile search sheet ran the search correctly (the
   input was filled and results were fetched) and then the whole sheet closed, hiding them.

   Cause: the chip handler calls go(q), which synchronously does renderLoading() ->
   searchPanel.innerHTML = ... . That DETACHES the chip that was just tapped, mid-dispatch.
   The click then keeps bubbling to the document-level outside-click handler in header.php,
   which asks `!t.closest(".cbs-nav")` - and on a now-orphaned node closest() returns null,
   so the tap was misread as a click OUTSIDE the nav and closeAll() ran.

   Fix: stop the click at .cbs-nav for elements the panel is about to re-render. The event
   path is fixed at dispatch time, so this listener still fires even though the target has
   been detached, and closest() on a detached node still finds the chip within its own
   subtree. Clicks inside .cbs-nav were already meant to be a no-op for that document
   handler, so nothing else changes - an outside tap still closes the sheet exactly as before. */
(function () {
  var nav = document.querySelector(".cbs-nav");
  if (!nav) return;
  nav.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.closest && t.closest("[data-cbs-suggest],[data-cbs-clear-recent],[data-cbs-search-result]")) {
      e.stopPropagation();
    }
  }, false);
})();
/* ============ /CBS-FIX-04 ============ */

/* ============ CBS-STABLE-HERO (2026-07-29) - kill the stray "0" badge flash ============
   Both count bubbles are server-rendered as a literal 0 and only corrected by JS. The
   CBS-AUDIT-FIX-01 sync ran on DOMContentLoaded (~1.1s), while CBS-ICONFONT-FOUC un-hides the
   badges as soon as document.fonts.ready fires (~0.3s) - so for ~800ms of a cold load a bright
   blue "0" sat on the cart glyph. Caught on a filmstrip once the loader stopped covering it.
   Fix: sync IMMEDIATELY (this file runs in the footer, so the header markup is already parsed)
   and only let the badges paint once that has happened - the CSS half is CBS-STABLE-HERO in
   style.css. A 1.5s failsafe releases the gate no matter what, so a badge can never be stuck. */
(function () {
  function syncNow() {
    var els = document.querySelectorAll(".cbs-nav__util-count");
    for (var i = 0; i < els.length; i++) {
      var n = parseInt((els[i].textContent || "").trim(), 10);
      if (isNaN(n)) n = 0;
      els[i].classList.toggle("is-zero", n === 0);
    }
    if (els.length) document.documentElement.classList.add("cbs-counts-synced");
  }
  syncNow();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", syncNow);
  window.addEventListener("load", syncNow);
  /* never let the gate strand a real badge */
  setTimeout(function () { document.documentElement.classList.add("cbs-counts-synced"); }, 1500);
})();
/* ============ /CBS-STABLE-HERO ============ */


/* ===== CBS-SWIPE-ASSIST (2026-08-02) — horizontal swipe drives the two scroll-told sections =====
   Feedback from testing: on the promo banners and the Integrity cards people's first instinct was
   to swipe horizontally, and when nothing happened they concluded the section was broken - they did
   not recover on their own. Both sections were sending a horizontal signal (a 22px peek of the next
   banner; a row of dots) while the actual driver was vertical scroll. On the banners a swipe could
   not possibly work: in pan mode the scroller is `width:max-content`, so scrollWidth === clientWidth
   and there is literally nothing to scroll.

   The fix is to accept the gesture people are already making, WITHOUT giving these sections a second
   source of truth. Both derive their state from scroll position - the Integrity flip picks a card
   index from how far into its runway you are, and the banners' pan is a CSS `animation-timeline`
   reading scroll progress with no JS in the loop at all. If a swipe set its own state, the next
   scroll event would recompute from position and yank it back (which is what the old DRAG builds
   ran into). So a swipe here does exactly one thing: it scrolls the page to the position that
   already means "next card". Everything downstream keeps working untouched, and the banners' CSS
   animation - the compositor-driven build that finally made this smooth on iOS - is not touched.

   Notes on the gesture handling:
   - Listeners are PASSIVE and never preventDefault, and `touch-action` is deliberately NOT changed.
     Claiming the axis with `touch-action:pan-y` would also kill pinch-zoom on these sections, which
     we are not willing to trade. Nothing here scrolls horizontally anyway, so a horizontal drag has
     nothing to fight.
   - Axis is decided once per gesture and never switched mid-swipe (real thumbs swipe at ~30 degrees).
   - Swipe LEFT advances, swipe RIGHT goes back, and both CLAMP at the section's own boundaries so a
     back-swipe on the first card cannot fling you up into the previous section.
   - Repeated fast swipes queue off the last intended index instead of the live scroll position, so
     three quick flicks advance three cards rather than fighting an in-flight smooth scroll.        */
(function(){
  if (!('ontouchstart' in window) && !(navigator.maxTouchPoints > 0)) { return; }

  var mm = function(){ return window.matchMedia && window.matchMedia('(max-width: 767px)').matches; };
  var reduce = function(){
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };
  var MIN_DX = 45;      /* below this it is a tap or a wobble, not a swipe */
  var DOMINANCE = 1.2;  /* horizontal must beat vertical by this much to count */
  var LOCK_MS = 420;    /* queue window for repeated flicks */

  function docTop(el){ return el.getBoundingClientRect().top + (window.pageYOffset || 0); }

  /* Native smooth scroll measured ~560ms for one banner - engine-controlled and not tunable,
     and slow enough on its own to read as lag even once the skip above was fixed (frame trace
     was clean, worst frame 15ms, so this was never render jank). Own the tween instead so a
     swipe lands in ~340ms.
     `html` carries `scroll-behavior:smooth`, which would turn every frame of the tween into its
     own smooth scroll, so it is neutralised for the duration and restored afterwards. */
  var TWEEN_MS = 340;
  var raf = 0, prevBehavior = null;

  function releaseBehavior(){
    if (prevBehavior !== null) {
      document.documentElement.style.scrollBehavior = prevBehavior;
      prevBehavior = null;
    }
  }
  function cancelTween(){
    if (raf) { cancelAnimationFrame(raf); raf = 0; releaseBehavior(); }
  }
  function goTo(y){
    cancelTween();
    y = Math.round(y);
    var y0 = window.pageYOffset || 0;
    var dy = y - y0;
    if (!dy) { return; }
    if (reduce()) { window.scrollTo(0, y); return; }
    prevBehavior = document.documentElement.style.scrollBehavior || '';
    document.documentElement.style.scrollBehavior = 'auto';
    var t0 = 0;
    raf = requestAnimationFrame(function step(now){
      if (!t0) { t0 = now; }
      var p = (now - t0) / TWEEN_MS;
      if (p > 1) { p = 1; }
      var e = 1 - Math.pow(1 - p, 3);            /* easeOutCubic */
      window.scrollTo(0, Math.round(y0 + dy * e));
      if (p < 1) { raf = requestAnimationFrame(step); }
      else { raf = 0; releaseBehavior(); }
    });
  }
  /* the moment a finger or a wheel arrives the user owns the scroll again, not the tween */
  window.addEventListener('touchstart', cancelTween, { passive: true });
  window.addEventListener('wheel', cancelTween, { passive: true });

  /* opts: el, count(), stepIndex(dir), yFor(i) */
  function wire(opts){
    var el = opts.el;
    if (!el) { return; }
    var x0 = 0, y0 = 0, axis = null, live = false, queued = -1, queuedAt = 0;

    el.addEventListener('touchstart', function(e){
      if (e.touches.length !== 1) { live = false; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
      axis = null; live = true;
    }, { passive: true });

    el.addEventListener('touchmove', function(e){
      if (!live || axis || e.touches.length !== 1) { return; }
      var dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
      var ax = Math.abs(dx), ay = Math.abs(dy);
      /* decide once, then stick with it for the rest of this gesture */
      if (ax > 12 && ax > ay * DOMINANCE) { axis = 'x'; }
      else if (ay > 12) { axis = 'y'; }
    }, { passive: true });

    el.addEventListener('touchend', function(e){
      if (!live) { return; }
      live = false;
      if (axis !== 'x' || !mm()) { return; }
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) < MIN_DX) { return; }

      var n = opts.count();
      if (n < 2) { return; }
      var now = Date.now();
      var dir = dx < 0 ? 1 : -1;
      var next = (queued >= 0 && (now - queuedAt) < LOCK_MS)
        ? queued + dir              /* queued flicks chain off the last INTENDED card */
        : opts.stepIndex(dir);      /* otherwise step to the adjacent boundary in that direction */
      if (next < 0) { next = 0; }
      if (next > n - 1) { next = n - 1; }
      var atY = opts.yFor(next);
      if (Math.abs(atY - (window.pageYOffset || 0)) < 4) { return; }
      queued = next; queuedAt = now;
      goTo(atY);
    }, { passive: true });

    el.addEventListener('touchcancel', function(){ live = false; }, { passive: true });
  }

  function init(){
    /* ---- 1. PROMO BANNERS -------------------------------------------------------------------
       Only in pan mode. In BASE mode the scroller is a real scroll-snap carousel that already
       swipes natively, and hijacking it would be a regression. Progress maps 1:1 to scroll over
       (runwayHeight - viewportHeight), so one banner is that distance / (n - 1).                */
    var promo = document.querySelector('[data-cbs-mswipe]');
    if (promo && promo.classList.contains('is-pan')) {
      var runway = promo.querySelector('.cbs-mswipe__runway');
      var slides = promo.querySelectorAll('.cbs-mswipe__slide');
      if (runway && slides.length > 1) {
        var pStep = function(){
          var span = runway.offsetHeight - (window.innerHeight || 1);
          return span > 0 ? span / (slides.length - 1) : 0;
        };
        /* THE LAG BUG. This used to round the current position to the nearest banner, which
           meant that once you were past the halfway point of a transition it decided you were
           ALREADY on the next banner - so a forward swipe sent you to the one after that. From
           51% of the way between banner 1 and 2, a swipe scrolled 1258px straight past banner 2.
           That is what read as "laggy and broken between the 1st and 2nd banner": a long scroll
           that overshot the thing you were reaching for.
           Now the target is always the adjacent boundary IN THE DIRECTION OF TRAVEL, so a swipe
           can never skip a banner and never travels more than one step. EDGE is a small tolerance
           so that sitting a few px short of a boundary still counts as being on it, instead of
           spending the swipe on an 8px nudge. */
        var EDGE = 0.08;
        wire({
          el: promo,
          count: function(){ return slides.length; },
          stepIndex: function(dir){
            var s = pStep(); if (!s) { return 0; }
            var rel = ((window.pageYOffset || 0) - docTop(runway)) / s;
            return dir > 0 ? Math.floor(rel + EDGE) + 1 : Math.ceil(rel - EDGE) - 1;
          },
          yFor: function(i){ return docTop(runway) + i * pStep(); }
        });
      }
    }

    /* ---- 2. INTEGRITY CARDS ------------------------------------------------------------------
       CBS-TRUST-SCROLL2 picks its card with  floor(((PIN - sectionTop) / travel) * N)  where
       PIN = 58. Inverting that for a given card k and landing in the MIDDLE of its band gives
       the scroll position below, so the existing onScroll() resolves to exactly k and its
       one-card-at-a-time step logic (which is what stops fast scrolling skipping cards) still
       owns the animation. travel is read back off the DOM rather than recomputed, so this cannot
       drift from whatever relayout() last set.                                                  */
    var trust = document.querySelector('.cbs-home__trust[data-tflip]');
    if (trust) {
      var PIN = 58;
      /* N used to come from counting dots; they are gone now (CBS-TFLIP-NODOTS), so read the
         contract the flip exposes, falling back to the source rows. The rows must be scoped to
         .cbs-trust__list - the two flip FACES also carry .cbs-trust__row, so an unscoped query
         returns N+2. */
      var tN = function(){
        var n = parseInt(trust.getAttribute('data-tflip-n'), 10);
        if (!n) { n = trust.querySelectorAll('.cbs-trust__list .cbs-trust__row').length; }
        return n || 4;
      };
      /* travel() verbatim from CBS-TRUST-SCROLL2. Derived rather than measured off the pin so
         it stays exact even though removing the dots made the pin shorter than the min-height
         relayout() last wrote. */
      var tTravel = function(){
        return tN() * Math.max(300, Math.round((window.innerHeight || 700) * 0.58));
      };
      var tY = function(k){ return docTop(trust) - PIN + tTravel() * ((k + 0.5) / tN()); };
      var tIndex = function(){
        var p = (PIN - trust.getBoundingClientRect().top) / tTravel();
        if (p < 0) { p = 0; } if (p > 1) { p = 1; }
        var i = Math.floor(p * tN());
        return i > tN() - 1 ? tN() - 1 : i;
      };
      if (tN() > 1) {
        wire({
          el: trust,
          count: tN,
          /* already floor-based, so it names the card you are actually looking at - +-1 from
             there is the adjacent one and cannot skip */
          stepIndex: function(dir){ return tIndex() + (dir > 0 ? 1 : -1); },
          yFor: tY
        });
      }
    }

    /* ---- 3. the nav pill's dock is CSS-ONLY now -----------------------------------------------
       This used to be a rAF-coalesced scroll listener writing `--cbs-pill-dock`. It stepped.
       **A JS scroll listener cannot drive scroll-linked motion smoothly in WebKit**: iOS delivers
       scroll updates to the main thread batched and late during momentum, so the value always
       lands from a stale scrollY and the element moves in visible chunks. Exactly the reason
       CBS-PROMO-MSCROLL was torn out and rebuilt as a CSS scroll-driven animation.
       The dock now lives in style.css as `animation-timeline: scroll()` on `transform`, which the
       compositor samples against the real scroll offset every frame. See CBS-PILL-DOCK there. */

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 260); });
  } else { setTimeout(init, 260); }
})();
/* ===== End CBS-SWIPE-ASSIST ===== */


/* ============ CBS-PV-SHAPE-V1 — PDP gallery outline (2026-08-04) ============
   The gallery's two tear notches were 15px black circles pinned to .cbs-pv-stub. Because
   .cbs-pv-gallery clips its children at the PADDING box, those circles could never cover the
   gallery's own 1px border — so the straight stroke ran unbroken PAST the bite and the notch
   read as a half-disc stuck onto a straight line instead of a cut through it.
   Fixed the way .cbs-card--bp already does it (CBS-BP-SHAPE-V1): draw the whole outline as
   ONE svg path with the notch arcs in it, then clip the gallery to that same path so the
   outer half of the 2px stroke is removed and a clean 1px outline remains. ============ */
(function(){
  var CORNER_R = 16;   /* the gallery's own border-radius */
  var NOTCH_R  = 8;    /* same notch radius as .cbs-card--bp */

  function buildPath(W, H, ny){
    var c = CORNER_R, n = NOTCH_R;
    if (ny < c + n)     ny = c + n;
    if (ny > H - c - n) ny = H - c - n;
    return [
      'M', c, 0,  'H', W-c, 'A', c, c, 0, 0, 1, W, c,
      'V', ny-n,  'A', n, n, 0, 0, 0, W, ny+n,
      'V', H-c,   'A', c, c, 0, 0, 1, W-c, H,
      'H', c,     'A', c, c, 0, 0, 1, 0, H-c,
      'V', ny+n,  'A', n, n, 0, 0, 0, 0, ny-n,
      'V', c,     'A', c, c, 0, 0, 1, c, 0, 'Z'
    ].join(' ');
  }

  function apply(gal){
    if (!gal) return;
    var stub = gal.querySelector('.cbs-pv-stub');
    var svg  = gal.querySelector('.cbs-pv-shape');
    if (!stub || !svg) return;
    var path = svg.querySelector('.cbs-pv-shape-path');
    if (!path) return;
    var rg = gal.getBoundingClientRect();
    var W = Math.round(rg.width), H = Math.round(rg.height);
    if (W < 40 || H < 40) return;
    /* the seam is the ticket header's real bottom edge, read from the DOM, so it tracks the
       stub's actual height instead of a hardcoded offset */
    var ny = Math.round(stub.getBoundingClientRect().bottom - rg.top);
    var d  = buildPath(W, H, ny);
    if (gal.getAttribute('data-pv-shape') === d) return;   /* no-op: also stops RO looping */
    gal.setAttribute('data-pv-shape', d);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    path.setAttribute('d', d);
    var cp = 'path("' + d + '")';
    gal.style.clipPath = cp;
    gal.style.webkitClipPath = cp;
    gal.classList.add('is-pv-shaped');
  }

  function applyAll(){
    var g = document.querySelectorAll('article.cbs-prod .cbs-pv-gallery');
    for (var i = 0; i < g.length; i++) { apply(g[i]); }
  }

  function init(){
    applyAll();
    if ('ResizeObserver' in window){
      var ro = new ResizeObserver(function(){ applyAll(); });
      var g = document.querySelectorAll('article.cbs-prod .cbs-pv-gallery');
      for (var i = 0; i < g.length; i++) { ro.observe(g[i]); }
    }
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
  /* images settling and orientation changes both move the seam */
  window.addEventListener('load', applyAll);
  window.addEventListener('resize', function(){ requestAnimationFrame(applyAll); });
})();
/* ============ /CBS-PV-SHAPE-V1 ============ */

/* ============ CBS-FLASH-V1 — one in-button confirmation helper (2026-08-04) ============
   This was implemented twice, near-identically: the wishlist IIFE took the restore markup as
   a parameter, the product-card IIFE captured it into data-orig. The capture is the safer of
   the two (it cannot restore the wrong label), so that is what the shared helper does, and an
   explicit `restore` is still honoured for the callers that pass one. Both local functions
   now delegate here, so there is one implementation and every call site is unchanged. ==== */
window.cbsFlash = function(btn, html, restore){
  if (!btn) return;
  if (restore === undefined || restore === null) {
    var o = btn.getAttribute("data-orig");
    if (o === null) { btn.setAttribute("data-orig", btn.innerHTML); o = btn.innerHTML; }
    restore = o;
  }
  if (btn.__cbsFlashT) { clearTimeout(btn.__cbsFlashT); }
  btn.classList.add("is-done");
  btn.innerHTML = html;
  btn.__cbsFlashT = setTimeout(function(){
    btn.classList.remove("is-done");
    btn.innerHTML = btn.getAttribute("data-orig") || restore;
    btn.__cbsFlashT = null;
  }, 1700);
};
/* ============ /CBS-FLASH-V1 ============ */

/* ============ CBS-SHIP-PROGRESS-V1 — free-shipping distance-to-goal (2026-08-04) ========
   The order summary stated "Shop for X more for free shipping" as a bare sentence. There is
   real distance-to-goal information there, so it now also draws a thin progress bar.
   The percentage is DERIVED from the two numbers already rendered on the page (the subtotal
   row, and the gap inside the note) rather than re-deriving the threshold client-side, so it
   cannot disagree with what the server calculated. Re-runs after the cart's AJAX swap. ==== */
(function(){
  function money(el){
    if (!el) return NaN;
    var t = (el.textContent || '').replace(/[^0-9.]/g, '');
    return t ? parseFloat(t) : NaN;
  }
  function subtotalOf(scope){
    var rows = scope.querySelectorAll('.cbs-cart__line-row');
    for (var i = 0; i < rows.length; i++){
      var dt = rows[i].querySelector('dt');
      if (dt && /subtotal/i.test(dt.textContent || '')) {
        return money(rows[i].querySelector('dd .amount') || rows[i].querySelector('dd'));
      }
    }
    return NaN;
  }
  function paint(note){
    if (!note) return;
    var scope = (note.closest && note.closest('.cbs-cart__fare')) || note.parentNode || document;
    var unlocked = !!note.querySelector('.is-unlocked');
    var bar = note.querySelector('.cbs-ship-prog');
    if (!bar){
      bar = document.createElement('span');
      bar.className = 'cbs-ship-prog';
      bar.setAttribute('aria-hidden', 'true');
      var fill = document.createElement('span');
      fill.className = 'cbs-ship-prog__fill';
      bar.appendChild(fill);
      note.insertBefore(bar, note.firstChild);
    }
    var pct = 0;
    if (unlocked) { pct = 100; }
    else {
      var gap = money(note.querySelector('strong .amount') || note.querySelector('strong'));
      var sub = subtotalOf(scope);
      if (isFinite(gap) && isFinite(sub) && (sub + gap) > 0) { pct = (sub / (sub + gap)) * 100; }
    }
    pct = Math.max(0, Math.min(100, pct));
    if (unlocked) { note.classList.add('is-done'); } else { note.classList.remove('is-done'); }
    var f = bar.querySelector('.cbs-ship-prog__fill');
    if (f) { f.style.setProperty('--cbs-ship-p', pct.toFixed(1) + '%'); }
  }
  function run(){
    var n = document.querySelectorAll('.cbs-cart__freeship, .cbs-co__freeship');
    for (var i = 0; i < n.length; i++) { paint(n[i]); }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', run); }
  else { run(); }
  /* the cart's AJAX swap replaces .cbs-cart__live wholesale, taking the bar with it */
  window.addEventListener('cbs:cart:changed', function(){ setTimeout(run, 40); });
  document.addEventListener('cbs:cart:changed', function(){ setTimeout(run, 40); });
  window.addEventListener('load', run);
})();
/* ============ /CBS-SHIP-PROGRESS-V1 ============ */
