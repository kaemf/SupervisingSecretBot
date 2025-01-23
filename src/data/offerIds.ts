import dotenv from 'dotenv'
dotenv.config()

export const offer = {
    1 : process.env._1_MONTH_OFFER,
    6 : process.env._6_MONTH_OFFER,
    12 : process.env._12_MONTH_OFFER
} as {[key: number]: string}