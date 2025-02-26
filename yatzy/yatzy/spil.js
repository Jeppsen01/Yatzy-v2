document.getElementById('roll-button').addEventListener('click', rollDice);

let currentRound = 1;
let rollsThisRound = 0;
const maxRounds = 15;
const maxRollsPerRound = 3;
let dieValues = new Array(5).fill(1);
let finalScore = new Array(15).fill(null);
let freq = new Array(6).fill(0);

function rollDice() {
    if (rollsThisRound >= maxRollsPerRound) return;

    for (let i = 0; i < 5; i++) {
        const die = document.getElementById(`die${i + 1}`);
        if (!die.classList.contains('locked')) {
            const roll = Math.floor(Math.random() * 6) + 1;
            dieValues[i] = roll;
            die.innerHTML = `<img src="${dieConverter(roll)}" alt="Die ${roll}">`;
        }
    }

    rollsThisRound++;
    updateRollsLeft();
    updateScoreButtons(getResults(dieValues));
}

function holdLock(event) {
    const die = event.currentTarget;
    die.classList.toggle('locked');
}

for (let i = 1; i <= 5; i++) {
    document.getElementById(`die${i}`).addEventListener('click', holdLock);
}

function updateScoreButtons(score) {
    let scoreIds = [
        "ones", "twos", "threes", "fours", "fives", "sixes",
        "one-of-a-kind", "two-of-a-kind", "three-same", "four-same",
        "small-straight", "large-straight", "full-house",
        "chance", "yahtzee"
    ];

    scoreIds.forEach((id, index) => {
        let button = document.querySelector(`#${id} button`);
        if (button) {
            if (finalScore[index] === null) {
                button.innerHTML = score[index];
                button.dataset.index = index;
                button.disabled = false;

                button.removeEventListener("click", inputClicked);
                button.addEventListener("click", inputClicked);
            } else {
                button.innerHTML = finalScore[index];
                button.disabled = true;
            }
        }
    });
}

function inputClicked(event) {
    const button = event.currentTarget;
    const index = button.dataset.index;

    if (finalScore[index] === null) {
        finalScore[index] = parseInt(button.textContent);
        button.innerHTML = finalScore[index];
        button.disabled = true;
    }

    updateSum();
}

function updateSum() {
    let sum = finalScore.slice(0, 6).reduce((a, b) => a + (b || 0), 0);
    document.querySelector("#sum input").value = sum;
    
    let total = finalScore.reduce((a, b) => a + (b || 0), 0);
    document.querySelector("#total input").value = total;

    let bonus = sum >= 63 ? 50 : 0;
    document.querySelector("#bonus input").value = bonus;
}

function frequency(dieValues) {
    freq = new Array(6).fill(0);
    dieValues.forEach(die => freq[die - 1]++);
}

function getResults(dieValues) {
    frequency(dieValues);
    let total = new Array(15).fill(0);

    for (let i = 0; i < 6; i++) {
        total[i] = sameValuePoints(i + 1);
    }

    total[6] = onePair();
    total[7] = twoPairs();
    total[8] = threeOfAKind();
    total[9] = fourOfAKind();
    total[10] = smallStraight();
    total[11] = largeStraight();
    total[12] = fullHouse();
    total[13] = chance(dieValues);
    total[14] = yatzy();

    return total;
}

function dieConverter(roll){
    switch (roll) {
        case 1:
            return 'dice-six-faces-one.png';
        case 2:
            return 'dice-six-faces-two.png';
        case 3:
            return 'dice-six-faces-three.png';
        case 4:
            return 'dice-six-faces-four.png';
        case 5:
            return 'dice-six-faces-five.png';
        case 6:
            return 'dice-six-faces-six.png';
    }
}

function sameValuePoints(value) {
    let sum = 0;
    
    for (let i = 0; i < dieValues.length; i++) {
        if (dieValues[i] === value) {
            sum += dieValues[i];
        }
    }

    return sum;
}


function onePair() {
    for (let i = freq.length - 1; i >= 0; i--) {
        if (freq[i] >= 2) {
            return (i + 1) * 2;
        }
    }
    return 0;
}

function twoPairs() {
    let pairs = [];
    for (let i = freq.length - 1; i >= 0; i--) {
        if (freq[i] >= 2) pairs.push((i + 1) * 2);
    }
    return pairs.length === 2 ? pairs.reduce((a, b) => a + b, 0) : 0;
}

function threeOfAKind() {
    for (let i = freq.length - 1; i >= 0; i--) {
        if (freq[i] >= 3) return (i + 1) * 3;
    }
    return 0;
}

function fourOfAKind() {
    for (let i = freq.length - 1; i >= 0; i--) {
        if (freq[i] >= 4) return (i + 1) * 4;
    }
    return 0;
}

function smallStraight() {
    let smallStraight = 15; 
    for (let i = 0; i < 5; i++) {
        if (freq[i] !== 1) {
            smallStraight = 0; 
        }
    }
    return smallStraight; 
}

function largeStraight() {
    let largeStraight = 20;
    for (let i = 1; i <= 5; i++) {
        if (freq[i] !== 1) {
            largeStraight = 0;
        }
    }
    return largeStraight;
}

function fullHouse() {
    let three = false;
    let two = false;
    
    for (let i = 0; i < freq.length; i++) {
        if (freq[i] === 3) {
            three = true;
        } else if (freq[i] === 2) {
            two = true;
        }
    }

    return three && two ? chance(dieValues) : 0;
}


function chance(dieValues) {
    return dieValues.reduce((sum, die) => sum + die, 0);
}

function yatzy() {
    return freq.includes(5) ? 50 : 0;
}

function updateRollsLeft() {
    document.getElementById('rolls-left').textContent = `Rolls left: ${maxRollsPerRound - rollsThisRound}`;
}

