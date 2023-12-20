import { useEffect } from "react";

const Dashboard = (props) => {
    useEffect(props.authCheckAgent, []);
    return <h1>Dashboard</h1>;
}

export default Dashboard;