// <BLOCK B>
// <BLOCK A>
// <END BLOCK B>
// <END BLOCK A>
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var screenWidth = window.screen.width; //находим ширину страницы

//Основные параметры, необходимые для работы программы:
class Parametrs {
    static illRadius;               //Радиус заражения (дм)
    static illChance;               //Вероятность заражения (%)
    static deathChance;             //Вероятность смерти (%)
    static illTime;                 //Период болезни (дни)
    static prMask;                  //Доля людей в масках (%)
    static prPrivito;               //Доля привитых людей (%)
    static objectsB = 50;           //Количество объектов блока B
    static objectsA = 1000;       //Количество объектов блока A
    static latentTime;              //Инкубационный период (дни)
    static imunTime;                //Период наличия иммунитета (дни)
    static radiusObjectB = 1;       //Радиус объекта класса В
    static blockAHeight = 1000;   //Высота блока A
    static blockAWidth = 1000;    //Ширина блока A
}

//Значения изменений параметров:
class Changes {
    static changeMaskIllChance = 10;      //Значение изменения персональной вероятности заражения наличием маски
    static changeVacineIllChance = 10;    //Значение изменения персональной вероятности заражения наличием вакцины
    static changeVacineDeathChance = 10;  //Значение изменения персональной вероятности смерти наличием вакцины
}

// <BLOCK B>    -    основной класс действий:
class ObjectBlockB {
    mask = false;                                   //Наличие маски
    vacine = false;                                 //Наличие вакцины
    startIll;                                       //Время начала болезни
    startImun;                                      //Время начала иммунитета
    personalBIllChance = Parametrs.illChance;       //Персональная вероятность заражения
    personalBDeathChance = Parametrs.deathChance;   //Персональная вероятность смерти
    static counterB = 0;                            //Счетчик объектов класса B
    static counterBIll = 0;                         //Счетчик заболевших класса B
    static counterBDeath = 0;                       //Счетчик мертвых класса B
    static counterBAlive = Parametrs.objectsB;      //Счетчик здоровых класса B
    counterVer2 = 0;                                //Производственная переменная для изменения направления
    static counterVer3 = 0;                         //Производственная переменная для подсчета вероятности
    counterVer4 = 0;                                //Производственная переменная для подсчета смерть/выздоровление
    color = "white";                                //Цвет здорового объекта
    objectRadius;                                   //Радиус объекта
    ill = false;                                    //Значение здоров/болен
    x = 0;
    y = 0;          //Координаты
    dx = 2;
    dy = -2;        //Изменение координат

    //Создание объекта класса B:
    constructor(mask, vacine) {
        ObjectBlockB.counterB++;                                            //Увеличиваем счетчик объектов класса B
        this.objectRadius = Parametrs.radiusObjectB;                        //Передаем персональный радиус объекта
        this.x = Math.floor(Math.random() * (canvas.width));
        this.y = Math.floor(Math.random() * (canvas.height));               //Передаем начальные координаты
        this.mask = mask;                                                   //Передаем значение параметра
        if (this.mask == true){
            this.personalBIllChance -= Changes.changeMaskIllChance;         //Настраиваем персональную вероятность заражения
        }
        this.vacine = vacine;                                               //Передаем значение параметра
        if (this.vacine == true){
            this.personalBIllChance -= Changes.changeVacineIllChance;       //Настраиваем персональную вероятность заражения
            this.personalBDeathChance -= Changes.changeVacineDeathChance;   //Настраиваем персональную вероятность смерти
        }
    }

    //Рисование объекта:
    drawObject() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.objectRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    //Движение объекта:
    move() {
        this.x += this.dx;
        this.y += this.dy;  //Перемещение
        //Отскок от стены:
        if (this.y + this.dy < this.objectRadius || this.y + this.dy > canvas.height - this.objectRadius) {
            this.dy = -this.dy;
        }
        if (this.x + this.dx < this.objectRadius || this.x + this.dx > canvas.width - this.objectRadius) {
            this.dx = -this.dx;
        }
        this.drawObject();
    }

    //Заражение объектов:
    makeIll(inkub) {                                                            //inkub - зараженный объект
        let nowTime = new Date().getTime();                                     //Назначение текущкго времени
        ObjectBlockB.counterVer3 = Math.floor(Math.random() * (100 - 1)) + 1;   //Получение рандомного числа [1;100]
        //Проверка возможности заражения (вероятность заражения) и наличия инкубационного периода у объекта-заразителя:
        if (ObjectBlockB.counterVer3 <= this.personalBIllChance && nowTime / 1000 - inkub.startIll / 1000 <= Parametrs.latentTime){
            //Проверка, что объект ранее болел:
            if (this.color == "#CC99FF"){
                //Проверка окончания иммунитета:
                if (nowTime / 1000 - this.startImun / 1000 >= Parametrs.imunTime){
                    this.ill = true;                                            //Изменение параметра
                    ObjectBlockB.counterBIll++;                                 //Увеличиваем счетчик заболевших класса B
                    this.color = "blue";                                        //Меняем цвет объекта
                    this.startIll = new Date().getTime();                       //Фиксируем время начала болезни
                    ObjectBlockB.counterBAlive -= 1;                            //Уменьшаем счетчик здоровых класса B
                }
            }
            else{
                this.ill = true;                        //Изменение параметра
                ObjectBlockB.counterBIll++;             //Увеличиваем счетчик заболевших класса B
                this.color = "blue";                    //Меняем цвет шарика
                this.startIll = new Date().getTime();   //Фиксируем время начала болезни
                ObjectBlockB.counterBAlive -= 1;        //Уменьшаем счетчик здоровых класса B
            }
        }
    }

    //Изменение направления:
    change() {
        this.counterVer2 = Math.round(Math.random());   //Получение рандомного числа [0;1]
        if (this.counterVer2 === 0) {
            this.dx = -this.dx;
        } else {
            this.dy = -this.dy;
        }
    }

    //Смерть объектов:
    death(ind, groupObjectsB) {
        let nowTime = new Date().getTime();                                 //Назначение текущкго времени
        //Проверка окончания времени болезни:
        if (nowTime / 1000 - this.startIll / 1000 >= Parametrs.illTime){
            this.counterVer4 = Math.floor(Math.random() * (100 - 1)) + 1;   //Получение рандомного числа [1;100]
            //Проверка возможности смерти (вероятность смерти):
            if (this.counterVer4 <= this.personalBDeathChance) {
                groupObjectsB.splice(ind, 1);                               //Удаление объекта из массива
                ObjectBlockB.counterBDeath++;                               //Увеличиваем счетчик мертвых класса B
                ObjectBlockB.counterBIll--;                                 //Уменьшаем счетчик заболевших класса B
            }
            else {
                this.ill = false;                           //изменение параметра
                ObjectBlockB.counterBIll--;                 //Уменьшаем счетчик заболевших класса B
                ObjectBlockB.counterBAlive += 1;            //Увеличиваем счетчик здоровых класса B
                this.color = "#CC99FF";                     //меняем цвет объекта
                this.startImun = new Date().getTime();      //Фиксируем время начала иммнитета
            }
         }
    }
}
// <END BLOCK B>



// <BLOCK A>    -    основной класс действий
class ObjectBlockA {
    mask = false;                                  //Наличие маски
    vacine = false;                                 //Наличие вакцины
    startIll;                                       //Время начала болезни
    startImun;                                      //Время начала иммунитета
    personalAIllChance = Parametrs.illChance;       //Персональная вероятность заражения
    personalADeathChance = Parametrs.deathChance;   //Персональная вероятность смерти
    static counterA = 0;                            //Счетчик объектов класса А
    static counterAIll = 0;                         //Счетчик заболевших класса А
    static counterADeath = 0;                       //Счетчик мертвых класса А
    static counterAAlive = Parametrs.objects;       //Счетчик здоровых класса А
    counterVer2 = 0;                                //Производственная переменная для изменения направления
    static counterVer3 = 0;                         //Производственная переменная для подсчета вероятности
    counterVer4 = 0;                                //Производственная переменная для подсчета смерть/выздоровление
    color = "white";                                //Цвет здорового объекта
    objectRadius;                                   //Радиус объекта
    ill = false;                                    //Значение здоров/болен
    x = 0;
    y = 0;          //Координаты
    dx = 2;
    dy = -2;        //Изменение координат

    //Создание объекта класса А:
    constructor(mask, vacine) {
        ObjectBlockA.counterA++;                                            //Увеличиваем счетчик объектов класса А
        this.objectRadius = 1;                                              //Передаем персональный радиус объекта
        this.x = Math.floor(Math.random() * (Parametrs.blockAWidth));
        this.y = Math.floor(Math.random() * (Parametrs.blockAHeight));      //Передаем наальные координаты
        this.mask = mask;                                                   //Передаем значение параметра
        if (this.mask == true){
            this.personalAIllChance -= Changes.changeMaskIllChance;         //Настраиваем персональную вероятность заражения
        }
        this.vacine = vacine;                                               //Передаем значение параметра
        if (this.vacine == true){
            this.personalAIllChance -= Changes.changeVacineIllChance;       //Настраиваем персональную вероятнось заражения
            this.personalADeathChance -= Changes.changeVacineDeathChance;   //Настраиваем персональную вероятнось смерти
        }
    }

    //Движение объекта:
    move() {  // движение
        this.x += this.dx;
        this.y += this.dy;  //Перемещение
        //Отскок от стены:
        if (this.y + this.dy < 1 || this.y + this.dy > Parametrs.blockAHeight - 1) {
            this.dy = -this.dy;
        }
        if (this.x + this.dx < 1 || this.x + this.dx > Parametrs.blockAWidth - 1) {
            this.dx = -this.dx;
        }
    }

    //Заражение объектов:
    makeIll(inkub) {                                                            //inkub - зараженный объект
        let nowTime = new Date().getTime();                                     //Назначение текущего времени
        ObjectBlockA.counterVer3 = Math.floor(Math.random() * (100 - 1)) + 1;   //Получение рандомного числа [1;100]
        //Проверка возможности заражения (вероятность заражения) и наличия инкубационного периода у объекта-заразителя:
        if (ObjectBlockA.counterVer3 <= this.personalAIllChance && nowTime / 1000 - inkub.startIll / 1000 <= Parametrs.latentTime){
            //Проверка, что объект ранее болел:
            if (this.color == "#CC99FF"){
                //Проверка окончания иммунитета:
                if (nowTime / 1000 - this.startImun / 1000 >= Parametrs.imunTime){
                    this.ill = true;                                            //Изменение параметра
                    ObjectBlockA.counterAIll++;                                 //Увеличение счетика заболевших класса А
                    this.color = "blue";                                        //Изменение цвета объекта
                    this.startIll = new Date().getTime();                       //Фиксирование времени начала болезни
                    ObjectBlockA.counterAAlive -= 1;                            //Уменьшение счетчика здоровых класса А
                }
            }
            else{
                this.ill = true;                        //Изменение параметра
                ObjectBlockA.counterAIll++;             //Увеличение счетика заболевших класса А
                this.color = "blue";                    //Изменение цвета объекта
                this.startIll = new Date().getTime();   //Фиксирование времени начала болезни
                ObjectBlockA.counterAAlive -= 1;        //Уменьшение счетчика здоровых класса А
            }
        }
    }

    //изменение направления:
    change() {
        this.counterVer2 = Math.round(Math.random());   //Получение рандомного числа [0;1]
        if (this.counterVer2 === 0) {
            this.dx = -this.dx;
        } else {
            this.dy = -this.dy;
        }
    }

    //Смерть объектов:
    death(ind, groupObjectsA) {
        let nowTime = new Date().getTime();                                 //Назначение текущего времени
        //Проверка окончания времени болезни:
        if (nowTime / 1000 - this.startIll / 1000 >= Parametrs.illTime){
            this.counterVer4 = Math.floor(Math.random() * (100 - 1)) + 1;   //Получение рандомного чесла [1;100]
            //Проверка возможности смерти (вероятность смерти):
            if (this.counterVer4 <= this.personalADeathChance) {
                groupObjectsA.splice(ind, 1);                               //Удаление объекта из массива
                ObjectBlockA.counterADeath++;                               //Увеличение счетчика мертвых класса А
                ObjectBlockA.counterAIll--;                                 //Уменьшение счетчика заболевших класса А
            }
            else {
                this.ill = false;                       //Изменение параметра
                ObjectBlockA.counterAIll--;             //Уменьшение счетчика заболевших класса А
                ObjectBlockA.counterAAlive += 1;        //Увеличение счетчика здоровых класса А
                this.color = "#CC99FF";                 //Изменение цвета объекта
                this.startImun = new Date().getTime();  //Фикрирование времени начала иммунитета
            }
         }
    }
}
// <END BLOCK A>



var firstButton = document.getElementById("start");     //Определяем первую кнопку
var secondButton = document.getElementById("finish");   //Определяем вторую кнопку
var graphikInterval;                                    //Определяем переменную для интервала, строящего графики

//Функция, описывающая первую кнопку:
firstButton.onclick = function() {
    Parametrs.illRadius = (parseInt(document.getElementById("radIll").value) * screenWidth) / 1300;
    Parametrs.illChance = parseInt(document.getElementById("chanceIll").value);
    Parametrs.deathChance = parseInt(document.getElementById("chanceDeath").value);
    Parametrs.illTime = parseInt(document.getElementById("timeIll").value);
    Parametrs.latentTime = parseInt(document.getElementById("periodLatent").value);
    Parametrs.prMask = parseInt(document.getElementById("masksOnAll").value);
    Parametrs.prPrivito = parseInt(document.getElementById("vacine").value);
    Parametrs.imunTime = parseInt(document.getElementById("timeImun").value);                       //Вводим параметры

    var second = 0;    //Задается изначальное количество секунд


    //Создаем интервал, строящий графики:
    graphikInterval = setInterval(()=>{
        second = second + 1;                //Считаем количество прошедших секунд
        graphik(second);                    //Запускаем функцию построения графиков
    }, 1000);

    firstButton.disabled = true;            //Отключаем активированную кнопку
    secondButton.disabled = false;          //Активируем вторую кнопку
    calculation();                          //Запускаем функцию расчетов
}

//Функция, описывающая вторую кнопку:
secondButton.onclick = function() {
    clearInterval(graphikInterval);     //Останавливаем интервал, создающий графики
    clearInterval(firstInterval);       //Останавливаем интервал для основных расчетов
    clearInterval(secondInterval);      //Останавливаем интервал для случайных перемещений
    secondButton.disabled = true;       //Отключаем активированную кнопку
}

var massiv = [['Секунда', 'Процент зараженных']];   //Создаем шапку первого массива (зараженные)
var massiv2 = [['Секунда', 'Процент мертвых']];     //Создаем шапку второго массива (мертвые)
var massiv3 = [['Секунда', 'Процент здоровых']];    //Создаем шапку третьего массива (здоровые)

//Функция, описывающая создание графиков:
function graphik(second){
    google.charts.load('current', {'packages':['corechart', 'line']});  //Что-то системное
    google.charts.setOnLoadCallback(drawFirstChart);    //Запускаем функцию, создающую первый график (зараженные)
    google.charts.setOnLoadCallback(drawSecondChart);   //Запускаем функцию, создающую второй график (мертвые)
    google.charts.setOnLoadCallback(drawPieChart);      //Запускаем функцию, создающую диаграмму
    google.charts.setOnLoadCallback(drawThirdChart);    //Запускаем функцию, создающую третий график (здоровые)

    massiv.push([second, (ObjectBlockA.counterAIll * 100) / (Parametrs.objectsA + 1)]);      //Добавляем новое значение в массив
    massiv2.push([second, (ObjectBlockA.counterADeath * 100) / (Parametrs.objectsA + 1)]);   //Добавляем новое значение в массив
    massiv3.push([second, ((Parametrs.objectsA + 1 - ObjectBlockA.counterAIll - ObjectBlockA.counterADeath) * 100) / (Parametrs.objectsA + 1)]);   //Добавляем новое значение в массив

    //Функция, описывающая создание первого графика (зараженных):
    function drawFirstChart() {
        var data = google.visualization.arrayToDataTable(massiv);   //Берем данные из массива

        var options = {
          title: 'Процент зараженных',      //Создаем заголовок
          legend: { position: 'bottom' }    //Создаем легенду
        };

        var chart = new google.visualization.LineChart(document.getElementById('first_curve_chart'));   //Подготовка к отрисовке

        chart.draw(data, options);  //Рисуем график
    }

    //Функция, описывающая создание второго графика (мертвых):
    function drawSecondChart() {
        var data = google.visualization.arrayToDataTable(massiv2);  //Берем данные из массива

        var options = {
          title: 'Процент мертвых',         //Создаем заголовок
          legend: { position: 'bottom' }    //Создаем легенду
        };

        var chart = new google.visualization.LineChart(document.getElementById('second_curve_chart'));  //Подготовка к отрисовке

        chart.draw(data, options);  //Рисуем график
    }

    //Функция, описывающая создание диаграммы:
    function drawPieChart() {
        var data = new google.visualization.DataTable();    //что-то системное

        data.addColumn('string', 'Тип людей');      //Добавляем столбец
        data.addColumn('number', 'Кол-во');         //Добавляем столбец
        data.addRows([
          ['Зараженные', ObjectBlockA.counterAIll],     //Добавляем область
          ['Здоровые', ObjectBlockA.counterADeath],     //Добавляем область
          ['Мертвые', Parametrs.objectsA + 1 - ObjectBlockA.counterAIll - ObjectBlockA.counterADeath]       //Добавляем область
        ]);

        var options = {
          'title': 'Соотношение',   //Создаем заголовок
        };

        var chart = new google.visualization.PieChart(document.getElementById('pie_chart'));    //Подготовка к отрисовке

        chart.draw(data, options);  //Рисуем диаграмму
    }

    //Функция, описывающая создание третьего графика (здоровых):
    function drawThirdChart() {
        var data = google.visualization.arrayToDataTable(massiv3);  //Берем данные из массива

        var options = {
          title: 'Процент здоровых',        //Создаем заголовок
          legend: { position: 'bottom' }    //Создаем легенду
        };

        var chart = new google.visualization.LineChart(document.getElementById('third_curve_chart'));   //Подготовка к отрисовке

        chart.draw(data, options);  //Рисуем график
    }
}


var firstInterval;      //Определяем переменную для интервала основных расчетов программы
var secondInterval;     //Определяем переменную для интервала случайных перемещений объектов

//Функция, описывающая основные расчеты программы:
function calculation() {

    let groupObjectsA = [];     //Массив объектов класса А
    let groupObjectsB = [];     //Массиа объектов класса В

    //Заполняем массив объектов класса В:
    for (let i = 0; i < Parametrs.objectsB; i++){
        let ver = Math.floor(Math.random() * (100 - 1)) + 1;    //Находим рандомное число [0;100]
        let ver2 = Math.floor(Math.random() * (100 - 1)) + 1;   //Находим рандомное число [0;100]

        //Определяем наличие маски:
        if (ver <= Parametrs.prMask){//Маска есть
            //Определяем наличие прививки:
            if (ver2 <= Parametrs.prPrivito){//Прививка есть
                groupObjectsB.push(new ObjectBlockB(true, true));
            }
            else{//Прививки нет
                groupObjectsB.push(new ObjectBlockB(true, false));
            }
        }
        else{//Маски нет
            //Определяем наличие прививки:
            if (ver2 <= Parametrs.prPrivito){//Прививка есть
                groupObjectsB.push(new ObjectBlockB(false, true));
            }
            else{//Прививки нет
                groupObjectsB.push(new ObjectBlockB(false, false));
            }
        }
    }

    //Заполняем массив объектов класса А:
    for (let i = 0; i < Parametrs.objectsA; i++){
        let ver = Math.floor(Math.random() * (100 - 1)) + 1;    //Находим рандомное число [0;100]
        let ver2 = Math.floor(Math.random() * (100 - 1)) + 1;   //Находим рандомное число [0;100]

        //Определяем наличие маски:
        if (ver <= Parametrs.prMask){//Маска есть
            //Определяем наличие прививки:
            if (ver2 <= Parametrs.prPrivito){//Прививка есть
                groupObjectsA.push(new ObjectBlockA(true, true));
            }
            else{//Прививки нет
                groupObjectsA.push(new ObjectBlockA(true, false));
            }
        }
        else{//Маски нет
            //Определяем наличие прививки:
            if (ver2 <= Parametrs.prPrivito){//Прививка есть
                groupObjectsA.push(new ObjectBlockA(false, true));
            }
            else{//Прививки нет
                groupObjectsA.push(new ObjectBlockA(false, false));
            }
        }
    }

    //Создаем зараженный объект для класса В:
    let objectBIll = new ObjectBlockB(false, false);    //Создаем зараженный объект для класса В
    objectBIll.ill = true;                              //Меняем значение параметра
    ObjectBlockB.counterBIll++;                         //Увеличиваем количество зараженных объектов класса В
    objectBIll.color = "blue";                          //Меняем цвет объекта
    objectBIll.startIll = new Date().getTime();         //Фиксируем время начала болезни
    groupObjectsB.push(objectBIll);                     //Добавляем объект в массив


    //Создаем зараженный объект для класса А:
    let objectAIll = new ObjectBlockA(false, false);    //Создаем зараженный объект для класса А
    objectAIll.ill = true;                              //Меняем значение параметра
    ObjectBlockA.counterAIll++;                         //Увеличиваем количество зараженных объектов класса А
    objectAIll.color = "blue";                          //Меняем цвет объекта
    objectAIll.startIll = new Date().getTime();         //Фиксируем время начала болезни
    groupObjectsA.push(objectAIll);                     //Добавляем объект в массив


    //Создаем интервал для основных расчетов программы:
    firstInterval = setInterval(()=>{
        ctx.clearRect(0, 0, canvas.width, canvas.height);   //Очищаем canvas


        //Проходим по всем элементам массива:
        for (let p of groupObjectsB){
            //Проверяем болен ли объект:
            if (p.ill == true){//болен
                p.death(groupObjectsB.findIndex(i => i == p), groupObjectsB);   //Активируем функцию смерти (выздоровления)
            }
            p.move();  //Передвигаем объекты
            //Проходим по всем элементам массива:
            for (let n of groupObjectsB){
                //Проверяем есть ли объекты в радиусе заражения:
                if (Math.abs(p.x - n.x) <= Parametrs.illRadius && Math.abs(p.y - n.y) <= Parametrs.illRadius && p != n){
                    //Проверяем первый объект на наличие вируса:
                    if (p.ill == true && n.ill != true){//есть
                        n.makeIll(p);   //Активируем функцию заражение
                    }
                    //Проверяем второй объект на наличие вируса:
                    if (p.ill != true && n.ill == true){//есть
                        p.makeIll(n);   //Активируем функцию заражение
                    }
                }
            }
        }



        //Проходим по всем элементам массива:
        for (let q of groupObjectsA){
            //Проверяем болен ли объект:
            if (q.ill == true){//болен
                q.death(groupObjectsA.findIndex(i => i == q), groupObjectsA);   //Активируем функцию смерти (выздоровления)
            }
            q.move();   //Передвигаем объекты
            //Проходим по всем элементам массива:
            for (let m of groupObjectsA){
                //Проверяем есть ли объекты в радиусе заражения:
                if (Math.abs(q.x - m.x) <= Parametrs.illRadius && Math.abs(q.y - m.y) <= Parametrs.illRadius && q != m){
                    //Проверяем первый объект на наличие вируса:
                    if (q.ill == true && m.ill != true){//есть
                        m.makeIll(q);   //Активируем функцию заражение
                    }
                    //Проверяем второй объект на наличие вируса:
                    if (q.ill != true && m.ill == true){//есть
                        q.makeIll(m);   //Активируем функцию заражение
                    }
                }
            }
        }
    } ,10)

    //Создаем интервал для случайных перемещений объектов:
    secondInterval = setInterval(()=>{
        //Проходим по всем элементам массива класса В:
        for (let p of groupObjectsB){
            p.change();     //Изменяем направление
        }
        //Проходим по всем элементам массива класса А:
        for (let q of groupObjectsA){
            q.change();     //Изменяем направление
        }
    } ,100)
}