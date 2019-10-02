import { builtInTypes } from "./../modules/dashboard/enums/builtInTypes";
import { customTypes } from "./../modules/dashboard/enums/customTypes";
import { inputTypes } from "./../modules/dashboard/enums/inputTypes";
import { validationTypes } from "./../modules/dashboard/enums/validationTypes";

const AdminConfig = {
    theme: {
        mainHeading: "פרויקט חדש",
        secondaryHeading: "כותרת משנה",
        logo: "https://getbootstrap.com/docs/4.3/assets/brand/bootstrap-solid.svg",
        palette: {
            primary: "#008DFA",
            secondary: "#DCEFFE"
        }
    },
    pages: [
        {
            title: "לוח עבודה",
            route: "",
            icon: ["fas", "calendar-alt"],
            layouts: [
                {
                    grid: "col",
                    heading: "לוח העבודה",
                    content: [
                        {
                            components: [
                                {
                                    custom: customTypes.DESKTOP
                                },
                                {
                                    builtIn: builtInTypes.TABLE,
                                    props: {
                                        model: "customuser",
                                        pluralized: "CustomUsers"
                                    }

                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            title: "Games",
            route: "games",
            icon: ["fas", "birthday-cake"],
            layouts: [
                {
                    grid: "col",
                    heading: "לוח העבודה",
                    content: [
                        {
                            components: [
                                {
                                    builtIn: builtInTypes.TABLE,
                                    props: {
                                        model: "games",
                                        // pluralized: "CustomUsers"
                                    }

                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}

export default AdminConfig;