export const createElement = (id?: string) => {
    const element = document.createElement('div');

    element.style.display = 'contents';
    if (id) {
        element.id = id;
    }
    return element;
};
