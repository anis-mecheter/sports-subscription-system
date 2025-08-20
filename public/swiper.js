// ===== Fetch sports data from server =====
fetch('/sports')
  .then(res => res.json()) // Parse JSON response
  .then(data => {
    const swiperWrapper = document.getElementById('sports-swiper');

    // ===== Create slides for each sport =====
    data.forEach(sport => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      slide.innerHTML = `
        <img src="/sports_img/${sport.sport_img}" alt="${sport.name}" class="sport-img" loading="lazy"/>
        <h3>${sport.name}</h3>
      `;
      swiperWrapper.appendChild(slide); // Append slide to Swiper wrapper
    });

    // ===== Initialize Swiper after adding slides =====
    new Swiper('.swiper-container', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      loop: true,
      coverflowEffect: {
        rotate: 30,
        stretch: 10,
        depth: 120,
        modifier: 1.2,
        slideShadows: true,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  })
  .catch(err => console.error('Failed to load sports data:', err)); // Handle errors
