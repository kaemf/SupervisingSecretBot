class Keyboard{
    next(){
        return [
            [
                {
                    text: 'Дальше'
                }
            ]
        ]
    }

    checkPayment(){
        return [
            [
                {
                    text: "Проверить оплату"
                }
            ]
        ]
    }

    AARoot(){
        return [
            [
                {text: "Перейти к оплате"}
            ],[
                {text: "Изменить почту"}
            ]
        ]
    }

    tarifs(){
        return [
            [
                {text: "1 месяц"}
            ],
            [
                {text: "6 месяцев"}
            ],
            [
                {text: "12 месяцев"}
            ]
        ]
    }

    typeOfPay(){
        return [
            [
                {text: "Другие банки"}
            ],[
                {text: "Банки для РФ"}
            ]
        ]
    }
    
}

export default new Keyboard();