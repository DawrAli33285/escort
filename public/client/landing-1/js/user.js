document.addEventListener('DOMContentLoaded', (event) => {
    const modalElement = document.getElementById("multiStepFormModal");
    const btns = document.querySelectorAll('[data-trigger="Auth.register"]');
    const bootstrapModal = new bootstrap.Modal(modalElement); // Inicializa o modal do Bootstrap
  
    // Adicionar um listener de clique para cada botão que abre o modal
    btns.forEach(btn => {
      btn.addEventListener('click', function() {
        bootstrapModal.show(); // Abre o modal usando o Bootstrap
      });
    });
  
    // Fechar o modal ao clicar fora do conteúdo é gerenciado automaticamente pelo Bootstrap
  
    // Gerenciamento de etapas do formulário
    const steps = document.querySelectorAll('.step');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    let currentStep = 0;
  
    function showStep(stepIndex) {
      steps.forEach((step, index) => {
        step.classList.toggle('d-none', index !== stepIndex);
      });
    }
  
    nextButtons.forEach(button => {
      button.addEventListener('click', function() {
        if (currentStep < steps.length - 1) {
          currentStep++;
          showStep(currentStep);
        }
      });
    });
  
    prevButtons.forEach(button => {
      button.addEventListener('click', function() {
        if (currentStep > 0) {
          currentStep--;
          showStep(currentStep);
        }
      });
    });
  
    // Inicializa mostrando o primeiro passo
    showStep(currentStep);
  });
  
 

  document.getElementById('multiStepForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        category: document.getElementById('category').value,
        adName: document.getElementById('adName').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
        location: document.getElementById('location').value
    };

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('User registered successfully!');
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error registering user');
    }
});


document.addEventListener('DOMContentLoaded', function() {
  const loginButton = document.querySelector('[data-trigger="Auth.login"]');
  
  if (loginButton) {
      loginButton.addEventListener('click', function() {
          const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
          loginModal.show();
      });
  }
});



document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
      loginForm.addEventListener('submit', function(event) {
          event.preventDefault();

          const email = document.getElementById('loginEmail').value;
          const password = document.getElementById('loginPassword').value;

          // Enviar os dados para a rota de login usando fetch API
          fetch('/auth/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email: email, password: password })
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  // Redirecionar o usuário se o login for bem-sucedido
                  window.location.href = '/account';
              } else {
                  // Exibir mensagem de erro do servidor
                  alert(data.message);
              }
          })
          .catch(error => {
              console.error('Error during login:', error);
              alert('An error occurred during login. Please try again later.');
          });
      });
  }
});

$('#countryDropdown').on('click', function (e) {
  e.preventDefault();
  $(this).next('.dropdown-menu').toggle();
});


// Definir as regiões para cada país
const regions = {
  brasil: [
    { name: 'Lisboa', city: 'lisboa' },
    { name: 'Porto', city: 'porto' },
    { name: 'Albufeira', city: 'albufeira' },
    { name: 'Braga', city: 'braga' },
    { name: 'Viseu', city: 'viseu' }
  ],
  portugal: [
      { name: 'Lisboa', city: 'lisboa' },
      { name: 'Porto', city: 'porto' },
      { name: 'Albufeira', city: 'albufeira' },
      { name: 'Braga', city: 'braga' },
      { name: 'Viseu', city: 'viseu' }
  ],
  germany: [
      { name: 'Berlin', city: 'berlin' },
      { name: 'Hamburg', city: 'hamburg' },
      { name: 'Frankfurt am Main', city: 'frankfurt' },
      { name: 'Düsseldorf', city: 'dusseldorf' },
      { name: 'München', city: 'munchen' }
  ],
  uk: [
      { name: 'London', city: 'london' },
      { name: 'Manchester', city: 'manchester' },
      { name: 'Birmingham', city: 'birmingham' },
      { name: 'Liverpool', city: 'liverpool' },
      { name: 'Cardiff', city: 'cardiff' }
  ],
  usa: [
      { name: 'Los Angeles', city: 'los-angeles' },
      { name: 'New York', city: 'new-york' },
      { name: 'Boston', city: 'boston' },
      { name: 'Washington D.C.', city: 'washington' },
      { name: 'Miami', city: 'miami' }
  ]
};


// Função para atualizar o texto do dropdown do país
function updateCountryText(country) {
  const countryNameElement = document.getElementById('countryName'); // Seleciona o elemento pelo ID
  if (countryNameElement) {
    countryNameElement.textContent = country.charAt(0).toUpperCase() + country.slice(1); // Atualiza e capitaliza o nome do país
  }
}

// Função para renderizar as regiões no dropdown
// Função para renderizar as regiões no dropdown
function renderRegions(country) {
  const regionDropdown = document.getElementById('regionDropdown');
  regionDropdown.innerHTML = ''; // Limpar as regiões anteriores

  const path = window.location.pathname.split('/');
  const categoryFromUrl = path[1]; // Extrai a categoria da URL

  if (regions[country]) {
    regions[country].forEach(region => {
      const regionLink = document.createElement('a');
      // Construir a URL dinamicamente
      regionLink.href = `/${categoryFromUrl}/${country}/${region.city}`;
      regionLink.className = 'dropdown-item btn btn-pure justify-content-start';
      regionLink.textContent = region.name;

      regionDropdown.appendChild(regionLink);
    });

    regionDropdown.style.display = 'block';
  } else {
    const noRegions = document.createElement('span');
    noRegions.className = 'dropdown-item';
    noRegions.textContent = 'No regions available for this country';
    regionDropdown.appendChild(noRegions);

    regionDropdown.style.display = 'block';
  }
}


// Adicionar evento de clique para os países e carregar regiões na abertura da página
document.addEventListener('DOMContentLoaded', function () {
  const path = window.location.pathname.split('/');
  const categoryFromUrl = path[1]; // Assume que a categoria está após a primeira barra
  const countryFromUrl = path[2]; // Assume que o país está após a segunda barra
  const geoCountry = document.getElementById('geoCountry').value;

  console.log('País detectado:', geoCountry);

  // Mapa de códigos de país para valores de data-country no dropdown
  const countryMap = {
      'BR': 'brasil',
      'PT': 'portugal',
      'DE': 'germany',
      'GB': 'uk',
      'US': 'usa'
  };

  // Verificar se não há país na URL (countryFromUrl é undefined ou vazio)
  if (!countryFromUrl || countryFromUrl === '') {
    const geo = { country: geoCountry }; // Usar o país detectado
    const matchedCountry = countryMap[geo.country];

    // Redireciona automaticamente se um país correspondente for detectado
    if (matchedCountry) {
      setTimeout(() => {
        window.location.href = `/${categoryFromUrl}/${matchedCountry}`;
      }, 100);
    }
  } else {
    // Código existente para lidar com a seleção manual
    if (regions[countryFromUrl]) {
      renderRegions(countryFromUrl);
      updateCountryText(countryFromUrl); // Atualiza o texto do dropdown para o país atual
    }

    document.querySelectorAll('[data-country]').forEach(countryLink => {
      countryLink.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedCountry = e.target.getAttribute('data-country');
        updateCountryText(selectedCountry);
        renderRegions(selectedCountry);

        // Redirecionar para a nova URL mantendo a categoria
        setTimeout(() => {
          window.location.href = `/${categoryFromUrl}/${selectedCountry}`;
        }, 100);
      });
    });
  }
});
