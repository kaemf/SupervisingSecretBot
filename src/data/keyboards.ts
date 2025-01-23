import { Markup } from "telegraf";
type HideableIKBtn = ReturnType<typeof Markup.button.callback>;

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

    pay(){
        return [
            [
                {
                    text: "Оплатить"
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
    
}

export default new Keyboard();