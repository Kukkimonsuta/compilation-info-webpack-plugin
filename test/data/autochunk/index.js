import('./jar').then(x => {
    const jar = new x.Jar();

    console.log('jar has ', jar.contents.length, ' cookies')

});