let carMoving = false;
let isPaused = false;
let animationFrameId;
let startTime = null;
let previousTimestamp = null;
let distanceTravelled = 0;
let totalTime = 0;

// Default values
const defaultValues = {
    mass: 100,
    frictionCoefficient: 0,
    thrust: 100
};

// Event listeners
document.getElementById('simulate').addEventListener('click', function() {
    if (!carMoving) {
        startSimulation();
    }
});

document.getElementById('reset').addEventListener('click', function() {
    reset();
});

document.getElementById('togglePause').addEventListener('click', function() {
    togglePause();
});

// Update displays on input change
document.getElementById('massValue').addEventListener('input', function() {
    const massValue = parseFloat(this.value).toFixed(0);
    document.getElementById('massDisplay').textContent = massValue;
});

document.getElementById('frictionValue').addEventListener('input', function() {
    const frictionValue = parseFloat(this.value).toFixed(2);
    document.getElementById('frictionDisplay').textContent = frictionValue;
});

document.getElementById('forceValue').addEventListener('input', function() {
    const forceValue = parseFloat(this.value).toFixed(0);
    document.getElementById('forceDisplay').textContent = forceValue;
});

function startSimulation() {
    // Get values from inputs
    const mass = parseFloat(document.getElementById('massValue').value);
    const frictionCoefficient = parseFloat(document.getElementById('frictionValue').value);
    const thrust = parseFloat(document.getElementById('forceValue').value);

    // Calculate acceleration
    const acceleration = calculateAcceleration(mass, frictionCoefficient, thrust);

    // Check if thrust is sufficient
    if (acceleration === 0) {
        const minimumThrust = Math.ceil(frictionCoefficient * mass * 9.8 / 10) * 10;
        alert(`Lực đẩy không đủ để di chuyển xe. Bạn cần ít nhất ${minimumThrust} N để xe có thể di chuyển.`);
        return;
    }

    // Disable inputs
    document.querySelectorAll('input[type="range"]').forEach(input => {
        input.disabled = true;
    });

    // Display acceleration
    document.getElementById('acceleration').textContent = acceleration.toFixed(2);

    // Initialize distance and time
    distanceTravelled = 0;
    totalTime = 0;

    // Start simulation
    carMoving = true;
    isPaused = false;
    document.getElementById('togglePause').disabled = false; // Enable Pause button
    document.getElementById('simulate').disabled = true; // Disable Simulate button
    startTime = performance.now();
    previousTimestamp = startTime;
    animationFrameId = requestAnimationFrame(moveCar);
}

function moveCar(timestamp) {
    if (isPaused) {
        return;
    }

    const deltaTime = (timestamp - previousTimestamp) / 1000; // Time elapsed in seconds
    previousTimestamp = timestamp;

    // Get values from inputs
    const mass = parseFloat(document.getElementById('massValue').value);
    const frictionCoefficient = parseFloat(document.getElementById('frictionValue').value);
    const thrust = parseFloat(document.getElementById('forceValue').value);

    // Calculate acceleration
    const acceleration = calculateAcceleration(mass, frictionCoefficient, thrust);

    // Update total time
    totalTime += deltaTime;

    // Calculate velocity based on acceleration and total time
    const velocity = acceleration * totalTime; // Velocity = Acceleration * Time

    // Update distance travelled
    distanceTravelled += velocity * deltaTime; // Distance = Velocity * Time

    // Update display
    document.getElementById('velocity').textContent = velocity.toFixed(2);
    document.getElementById('distance').textContent = distanceTravelled.toFixed(2);
    document.getElementById('time').textContent = totalTime.toFixed(2);

    const car = document.getElementById('car');
    const containerWidth = document.querySelector('.container').clientWidth;

    // Calculate new position
    let newPosition = (car.offsetLeft || 0) + velocity * deltaTime * 100; // Adjust multiplier as needed

    // Ensure car stays within container
    if (newPosition >= 0 && newPosition <= containerWidth - car.offsetWidth) {
        car.style.left = newPosition + 'px';
        animationFrameId = requestAnimationFrame(moveCar);
    } else {
        carMoving = false;
        cancelAnimationFrame(animationFrameId); // Stop animation if out of bounds
        showSimulationCompleteMessage(); // Show success message
        resetCarPosition(); // Reset car position
    }
}

function calculateAcceleration(mass, frictionCoefficient, thrust) {
    // Calculate friction force
    const frictionForce = frictionCoefficient * mass * 9.8;

    // Calculate acceleration
    if (Math.abs(thrust) > frictionForce) {
        return (thrust - frictionForce) / mass;
    } else {
        return 0; // No acceleration if thrust is insufficient
    }
}

function reset() {
    // Reset input values
    updateValue('massValue', defaultValues.mass);
    updateValue('frictionValue', defaultValues.frictionCoefficient);
    updateValue('forceValue', defaultValues.thrust);

    // Reset displays
    document.getElementById('massDisplay').textContent = defaultValues.mass;
    document.getElementById('frictionDisplay').textContent = defaultValues.frictionCoefficient.toFixed(2);
    document.getElementById('forceDisplay').textContent = defaultValues.thrust;

    // Reset acceleration display, velocity display, distance display, time display, and car position
    document.getElementById('acceleration').textContent = '0';
    document.getElementById('velocity').textContent = '0';
    document.getElementById('distance').textContent = '0';
    document.getElementById('time').textContent = '0';
    resetCarPosition();

    // Reset pause and movement states
    carMoving = false;
    isPaused = false;
    document.getElementById('togglePause').textContent = 'Tạm dừng'; // Change button text
    document.getElementById('simulate').disabled = false; // Enable Simulate button

    // Enable inputs
    document.querySelectorAll('input[type="range"]').forEach(input => {
        input.disabled = false;
    });

    // Cancel current animation frame if any
    cancelAnimationFrame(animationFrameId);
    document.getElementById('togglePause').disabled = true; // Disable Pause button
}

function togglePause() {
    if (carMoving) {
        isPaused = !isPaused;
        document.getElementById('togglePause').textContent = isPaused ? 'Tiếp tục' : 'Tạm dừng';

        if (!isPaused) {
            previousTimestamp = performance.now(); // Reset previous timestamp to avoid time jump
            moveCar(previousTimestamp); // Continue moving if resuming
        }
    }
}

function updateValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
        // Update the display values as well
        if (id === 'massValue') {
            document.getElementById('massDisplay').textContent = value;
        } else if (id === 'frictionValue') {
            document.getElementById('frictionDisplay').textContent = value.toFixed(2);
        } else if (id === 'forceValue') {
            document.getElementById('forceDisplay').textContent = value;
        }
    }
}

function showSimulationCompleteMessage() {
    alert('Mô phỏng hoàn tất! Bạn có thể điều chỉnh các thông số và chạy lại mô phỏng.');
    // Enable input fields for new simulation
    document.querySelectorAll('input[type="range"]').forEach(input => {
        input.disabled = false;
    });
    document.getElementById('simulate').disabled = false;
    document.getElementById('togglePause').disabled = true; // Disable Pause button
}

function resetCarPosition() {
    const car = document.getElementById('car');
    car.style.left = '0px'; // Reset car position to the start
}
