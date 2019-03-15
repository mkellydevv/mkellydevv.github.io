$(document).ready(function(){

    const handleScroll = function () {
        // Get scroll direction
        let new_scroll_top = $(this).scrollTop();
        let scroll_dir = (new_scroll_top > prev_scroll_top) ? 'down' : 'up';

        updateSectionParallax(scroll_dir,y_offset,null);

        // Add and remove scrolled class from various elements
        if(new_scroll_top > 0)
            $('.home_container, .home_scroll').addClass('scrolled');
        else 
            $('.home_container').removeClass('scrolled');
        
        prev_scroll_top = new_scroll_top; 
    };

    const smoothScroll = function (id) {
        let y = 0;
        if (id !== 'home')
            y = section_map.get(id).top-y_offset;

        $(this).scrollTop(y);
    }

    const updateSectionMap = function () {
        current_section = sections[0];

        if($(window).width() <= 576) {
            $('.navbar').addClass("navbar-dark bg-dark");
        } else {
            $('.navbar').removeClass("navbar-dark bg-dark");
        }

        let $sections = $('.parallax-section');
        window_height = $(window).height();
        window_width = $(window).width();
        y_offset = 0; //$('.navbar').outerHeight();

        // Reset map and sections
        $('.parallax-section-dummy').remove();
        $sections.removeClass('parallax-section-active');
        $sections.css('top','');
        section_map = new Map();
        
        for (let i = 0; i < $sections.length; i++) {
            let id = $sections[i].id;
            let $section = $('#'+id);
            let dim = {width:Math.round($section.outerWidth()),height:Math.round($section.outerHeight())};
            let offset = $section.offset();
            let parallax_ratio = $section.data('speed') || null;


            section_map.set(id,{
                fixed_top:      -(dim.height-window_height),
                top:            Math.round(offset.top),
                bottom:         Math.round(offset.top)+dim.height,
                width:          dim.width,
                height:         dim.height,
                dummy:          null,
                parallax_ratio: parallax_ratio
            });
        }
    }

    const switchSection = function (dir) {
        let index = sections.indexOf(current_section);
        $('.nav-link').removeClass('active');
        
        if (dir === 'next') {
            if (index < sections.length - 1) {
                current_section = sections[index+1];
                $(`#${current_section}_link`).addClass('active');
            }
        } else if (dir === 'prev') {
            if (index > 0) {
                current_section = sections[index-1];
                $(`#${current_section}_link`).addClass('active');
            }
        }
        $(`#${current_section}_link`).addClass('active');
    }

    const updateSectionParallax = function (scroll_dir,y_offset,parallax_ratio=null) {
        let $sections = $('.parallax-section');
        let scroll_pos = $(this).scrollTop();
        let epsilon = 0.1;

        for (let i = 0; i < $sections.length; i++) {
            let id = $sections[i].id;
            let $section = $('#'+id);
            let sec_data = section_map.get(id);
            let threshhold = scroll_pos + window_height + y_offset;

            if (threshhold > sec_data.bottom) {
                $section.addClass('hide-section');
            }

            if (threshhold > sec_data.bottom && sec_data.dummy === null) {

                // Add a dummy with the same dimensions as the section
                let $dummy = document.createElement("div");
                $dummy.style.width = sec_data.width+'px';
                $dummy.style.height = sec_data.height+'px';
                $dummy.classList.add('parallax-section-dummy');
                $section.after($dummy);
                sec_data.dummy = $dummy;

                // Makes section have a fixed position
                $section.css('top',sec_data.fixed_top+y_offset);
                $section.addClass('parallax-section-active');

                switchSection('next');
            } else if (sec_data.bottom >= threshhold && sec_data.dummy !== null) {
                // Removes dummy, active, class and styling
                $section.css('top','');
                sec_data.dummy.remove();
                sec_data.dummy = null;
                $section.removeClass('parallax-section-active');
                $section.removeClass('hide-section');

                switchSection('prev');
            } else if (scroll_dir === 'up' && sec_data.dummy !== null &&
                sec_data.bottom >= scroll_pos + (window_height*0.9)) {
                $section.removeClass('hide-section');
            }
        }

        // Apply parallax_ratio to each active section
        let $active_sections = $('.parallax-section.parallax-section-active');
        let $last = $sections.last()[0];
        for (let i = 0; i < $active_sections.length; i++) {
            // Remove this from codepen build
            if ($active_sections[i] === $last)
                return;

            let id = $active_sections[i].id;
            let sec_data = section_map.get(id);
            let diff = scroll_pos + y_offset - sec_data.top;
            let ratio = parallax_ratio;

            // Add the fixed_top offset to the difference
            if (Math.abs(sec_data.fixed_top) > epsilon)
                diff += sec_data.fixed_top;

            // Use the data-speed attribute of the section if no parallax_ratio given
            if (ratio === null)
                ratio = sec_data.parallax_ratio;
            
            if (ratio !== null)
                $(`#${id}.parallax-section-active`).css('top',(sec_data.fixed_top+y_offset)-(diff*ratio));
        }
    }

    $('[data-toggle="popover"]').popover({ trigger: "hover" });

    // Modal Event handlers
    $('.modal').on('show.bs.modal',function (event) {
        $('#portfolio').addClass('hide-section');
        $('.navbar').addClass('hidden');
    });
    $('.modal').on('shown.bs.modal',function (event) {
        $('.modal').find('.carousel-item.active').addClass('show');
    });
    $('.modal').on('hide.bs.modal',function (event) {
        $('.modal').find('.carousel-item').removeClass('show');
        $('#portfolio').removeClass('hide-section');
        $('.navbar').removeClass('hidden');
    });

    // On carousel slid/slide
    $('.modal .carousel').on('slid.bs.carousel',function (event) {
        $('.modal').find('.carousel-item.active').addClass('show');
    });
    $('.modal .carousel').on('slide.bs.carousel',function (event) {
        $('.modal').find('.carousel-item').removeClass('show');
    });

    $('#email_copy_btn').on('click',function (event) {
        copyText('m.'+'kelly.'+'devv'+'@gmail.com');
    });

    const addEM = function () {
        setTimeout(()=>{
            let parts = ['kelly.','devv','.com','@gmail','m.'];
            let em = parts[4]+parts[0]+parts[1]+parts[3]+parts[2];

            $('#contact_em').append($(`<a href='mailto:${em}'>
                <p>${em}</p>
            </a>`));
            $('#btn_copy_email').attr('data-clipboard-text',em);
        },1000);
    }

    const addScrollIndicator = function () {
        if ($(this).scrollTop() !== 0)
            return;

        setTimeout(()=>{
            $('.home_scroll').css('opacity',1);
        },3000);
    }

    addScrollIndicator();
    // Add obfuscated em
    addEM();

    
    let sections = ['home','about','skills','portfolio','contact'];
    let current_section = sections[0];
    let y_offset = 0; // $('.navbar').outerHeight();
    let window_height = $(window).height();
    let prev_scroll_top = $(window).scrollTop();
    let section_map = new Map();
    let disable_scroll = false;
    updateSectionMap();

    $(window).scroll(()=>{
        if (disable_scroll === false)
            handleScroll();
    });
    //$(window).resize(()=>{updateSectionMap();});
    let resizeTimer;
    $(window).on('resize', function(e) {

        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
          // Run code here, resizing has "stopped"
          updateSectionMap();

        
                  
        }, 500);
      
      });
    $('.nav-link').click((event)=>{
        let href = $(event.target).attr('href');
        let id = href.substring(1,href.length);

        let curr_i = sections.indexOf(current_section);
        let new_i = sections.indexOf(id);
        let scroll_dir = null;

        if (new_i < curr_i ) 
            scroll_dir = 'up';
        else if (new_i > curr_i)
            scroll_dir = 'down';    

        if ($('.hide-section').last()[0] && scroll_dir === 'up')
            $($('.hide-section').last()[0]).removeClass('hide-section');

        // Set nav-link to active
       // $('.nav-link').removeClass('active');
       // $(`#${current_section}_link`).addClass('active');

        smoothScroll(id);
        return false;
    });

    // In case of page reload
    if ($(this).scrollTop() !== 0) {
        $(`#${current_section}_link`).click();

        setTimeout(()=>{
            console.log('cur sec',current_section)
            $(`#${current_section}`).removeClass('hide-section');
            $(`#${current_section}`).nextAll().removeClass('hide-section');
            $('section').addClass('section-transition');
        },550);
    } else {
        $(`#${current_section}`).removeClass('hide-section');
        $(`#${current_section}`).nextAll().removeClass('hide-section');
        $('section').addClass('section-transition');
    }

    let clip = new ClipboardJS('#btn_copy_email');
});

const goToLink = function (link) {
    location.href = link;
}

const filterSelection = function (selection) {
    $('.filter-group').fadeTo(300, 0.01,()=>{
        $(".filter-group").fadeTo(300, 1);
        if (selection === 'filterable-all')
            $('.filterable').fadeIn(300).removeClass('shrink');
        else
            $("."+selection).fadeIn(300).removeClass('shrink');
    });
    $('.filterable').fadeOut(300).addClass('shrink');
};

filterSelection('filterable-all');

