const joi=require('joi')

exports.signupSchema=joi.object({
    email:joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds:{allow:['com','net']}
        }),
    password:joi.string()
        .required()
        .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/))
})

exports.signinSchema=joi.object({
    email:joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds:{allow:['com','net']}
        }),
    password:joi.string()
        .required()
        .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/))
})

exports.acceptCodeSchema=joi.object({
    email:joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds:{allow:['com','net']}
        }),
    providedcode:joi.number()
        .required()
})

exports.changePasswordSchema=joi.object({
    newPassword:joi.string()
        .required()
        .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/)),
    oldPassword:joi.string()
        .required()
        .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/)),
})

exports.acceptForgotPasswordCodeSchema=joi.object({
    email:joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds:{allow:['com','net']}
        }),
    providedcode:joi.number()
        .required(),
    newPassword:joi.string()
        .required()
        .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/)),
})

exports.createPostsSchema=joi.object({
    title:joi.string().min(3).max(60).required(),
    description:joi.string().min(3).max(600).required(),
    userId:joi.string().required()
})

exports.deletePostsSchema=joi.object({
    userId:joi.string().required()
})