import http from 'k6/http';
import { group } from 'k6';
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

    group("A A", () => {
        http.get(`http://localhost:3000/richardpod/mycontainer/mything`, {
          headers: {
              "Content-Type": "application/version-query"
          }
        });
    })
}