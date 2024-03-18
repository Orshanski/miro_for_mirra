document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    let posX = 0, posY = 0, scale = 1;
    const container = document.getElementById('canvas-container');
    const modal = document.getElementById("modal"); // Кэширование модального окна
    const modalImg = document.getElementById("modal-img"); // Кэширование изображения в модальном окне

    drawArrows();
    attachModalEventListeners(); // Вызов функции для добавления обработчика событий модального окна

    function dragStart(e) {
        e.preventDefault();
        let startX = e.clientX - posX;
        let startY = e.clientY - posY;

        function dragging(e) {
            posX = e.clientX - startX;
            posY = e.clientY - startY;
            updateCanvas();
        }

        function dragEnd() {
            container.removeEventListener('mousemove', dragging);
            container.removeEventListener('mouseup', dragEnd);
        }

        container.addEventListener('mousemove', dragging);
        container.addEventListener('mouseup', dragEnd);
    }

    function zoom(e) {
        e.preventDefault();
        const zoomIntensity = 0.05;
        const wheelDelta = e.deltaY < 0 ? 1 : -1;
        const zoomFactor = Math.exp(wheelDelta * zoomIntensity);
        scale *= zoomFactor;
        updateCanvas();
    }

    function updateCanvas() {
        canvas.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
        drawArrows();
    }

    container.addEventListener('mousedown', dragStart);
    container.addEventListener('wheel', zoom);

    document.querySelectorAll('.navigate').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            navigateToContainer(this.getAttribute('data-target'));
        });
    });

    function navigateToContainer(targetId) {
        const target = document.getElementById(`container-${targetId}`);
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        posX = -target.offsetLeft * scale + viewportWidth / 2 - target.offsetWidth / 2 * scale;
        posY = -target.offsetTop * scale + viewportHeight / 2 - target.offsetHeight / 2 * scale;
        updateCanvas();
    }

    document.querySelectorAll(".clickable-word").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            modalImg.src = e.target.getAttribute("data-image-url");
            modal.style.display = "flex";
        });
    });

    function attachModalEventListeners() {
        modal.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }
});

function drawArrows() {
    const svg = document.getElementById('arrows-svg');
    svg.innerHTML = '';
    const arrows = []; // Используется для оптимизации наведения

    document.querySelectorAll('.container-box').forEach(container => {
        const sourceRect = container.getBoundingClientRect();

        container.querySelectorAll('.navigate').forEach(link => {
            const targetId = link.getAttribute('data-target');
            const target = document.getElementById(`container-${targetId}`);
            if (target) {
                drawArrow(container.id, targetId, sourceRect, target.getBoundingClientRect(), svg, arrows);
            }
        });
    });

    setupArrowHoverEffect(arrows);
}

function drawArrow(sourceId, targetId, sourceRect, targetRect, svg, arrows) {
    const x1 = sourceRect.left + sourceRect.width / 2;
    const y1 = sourceRect.top + sourceRect.height / 2;
    const x2 = targetRect.left + targetRect.width / 2;
    const y2 = targetRect.top + targetRect.height / 2;

    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    arrow.setAttribute('x1', x1);
    arrow.setAttribute('y1', y1);
    arrow.setAttribute('x2', x2);
    arrow.setAttribute('y2', y2);
    arrow.setAttribute('stroke', 'black');
    arrow.setAttribute('stroke-width', '1');
    arrow.setAttribute('marker-end', 'url(#arrowhead)');
    arrow.setAttribute('data-source', sourceId);
    arrow.setAttribute('data-target', targetId);

    svg.appendChild(arrow);
    arrows.push({sourceId, arrow}); // Добавляем стрелку и источник в массив для последующей обработки наведения
}

function setupArrowHoverEffect(arrows) {
    arrows.forEach(({sourceId, arrow}) => {
        const source = document.getElementById(sourceId);
        source.addEventListener('mouseenter', () => arrow.setAttribute('stroke', 'red'));
        source.addEventListener('mouseleave', () => arrow.setAttribute('stroke', 'black'));
    });
}
