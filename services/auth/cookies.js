const setCookies = (res, authData, invalidate) => {
    const options = {
        httpOnly: true,
        sameSite: 'Lax',
        domain: process.env.NODE_ENV === 'production' ? 'entours.app' : 'localhost',
        secure: process.env.NODE_ENV === 'production',
        expires: invalidate
            ? new Date(Date.now() + 2000)
            : new Date(Date.now() + authData.expires)
    };

    // const nameOptions = {...options};
    // nameOptions.httpOnly = false;
    // nameOptions.secure = false;
    // delete nameOptions.sameSite

    res.cookie('authToken', authData ? authData.token : '', options )
    res.cookie('exp', authData ? authData.expires : '', options )
    // res.cookie('userId', authData ? authData.user._id.toString() : '', nameOptions )
}

module.exports = {
    setCookies
}