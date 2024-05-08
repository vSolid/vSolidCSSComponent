import http from 'k6/http';
import { group, check} from 'k6';
export const options = {
  vus: 10,
  duration: '30s',
};


export default function () {
    // group("Version query", () => {
    //       http.get('http://localhost:3000/richardpod/mycontainer/mything?delta_id=42f250c3-8265-4105-9c03-13c701c504b8', {
    //         headers: {
    //             "Content-Type": "application/version-materialization"
    //         }
    //       });
    // })

    group("Version materialization", () => {
        const res = http.get(`http://localhost:3000/testpod/bingbong`);

        
        if (res.status !== 200) {
            console.log(`Request failed. Status: ${res.status}, Body: ${res.body}`);
        }
    });
}