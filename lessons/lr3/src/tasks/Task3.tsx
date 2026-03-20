/**
 * Задание 3: Responsive сетка
 *
 * Задачи:
 * 1. grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
 * 2. Скрыть рейтинг на мобильных: hidden md:flex
 */

const products = [
  { id: 1, name: 'Ноутбук', price: 89990, rating: 4.8, image: 'https://yandex-images.clstorage.net/anj4D8264/16614a4uE/kaJIawkkr9Dbf18irVgH4Zjj0ulzOwmq7r80uUmJlGX5q9njGHaBVJZzHm-2O8g0tZd2-Zlh8WP2RgbiRafurJnzHXY4Oa-lpjJXe_14C_WQlqflN0phu5rWPcg0ibU93OPcUrWvYJ0iyrbGfpIsWLT6N6i1GOEiQr8Ww4mWsvxFztAXxazKdHdTgoap7Dc5vCo62VtC3SOukyEc1GSRMB3G1PZNr9TRkvqu7s6eiHiEznvkiMB1klYqOq-d5t603c6oG9180jjLO6YSIXT7NbAO5jX_Zj3XltcxHIjA4TilljyChRMoAfLGmmqq6kRkvKIPuITIFT4mEsZnFWZ2HEGSaHvF9ILgy9daAglEt8HYvkpl29I5H7aHgRi0hNWAETYcYilrJM26Froysh4Q3IxqI4xgBGG2Nn6m5wU6ohyJ4uhrNShK8L_b3s6N4GNB5BbONUtSESeKA4l06PSV3OV6DEZtz7BBzjpKrj5qtFTgfjOUGIxNInJyvvP9xuZgfX6cj1n4NjBbM0IqRTz7Nbgirn0rcnEjys8FlKR43dhtFlgGaeegoc7iciZybnAw1MqzrJSoeU5qxpK_Mb5-YM3iRL8VsLrYD3OOAl1gGzkcpmZ1e9aZz6rLHQRgBJHIYZacbtk_zKlmwj52tvb0cJxOt5jQABUW9mKiPwHiKryJ2pwLVUhuWMcztsoJAP89kE5SlYdW9a-mn4lsrAjRVHHOML7Zs2gJOlLC-s4-iNx81nNk0PSB6gKm3vuFClKknW6QrzksZrDrixo6wcRr5awuRgF3egnDVldlQEhk9VhNwgCqXY_wHer-Pko27rjskEYv-NA0mTZ2XnazLZJeCMly0F8psLJ0_9saDl3QY13QIsqNs65RE_IPdViYQAVYueqINl2H6P3uXlKm-pbMhOyGR7B8KHnu8nJKZ3063qDRXuRTBchy5K_jJs4phGuRiOoq_VPO7QMqt_FUTKhc' },
  { id: 2, name: 'Смартфон', price: 69990, rating: 4.7, image: 'https://yandex-images.clstorage.net/anj4D8264/16614apbo/xboBUjBQ5rDrPxZShGQL4cG6jtVfeiHuqqMxnTzUzVWdktCKRBa1RI8XHwOzCrAIrD4DrbFl7C_zG3OuSM_z3cSfFWJoIbvQxy8GB_Vgd9WQfhZV4-LJM1o_uWi4rN08ubLxlgF_GOjeXu5a5nJECCzu73z8vDFKLt52WxFmhhBF8nAT5cDe4Ou_xraBaIuRyNruVVeueQNCFwlkHIztCPX-zE6Vzwx98jL6Koo63AhU4ves5PCNIgpK_sPdaoo0mR7UNwU05qT7v5oS8WAzwSCuJumrfhk_dpNtENCQ1WSBosBG9WN8RQ76cqoikkBUlILvJLQojc72WtbzkZ7ihDVO8IMB_Mb0S7umVsXYh2EAToqRp7JR71bLdeSEKOWsrZYkioHrbCluemL29pKIJBSSH_h8OPnCcpZSV0Ue3iyxHmADKcT6cEPX-iaFhHMtEGrONTM-JcOmV_mQIKCJuL2OXAKtfygldm6aCrLufLhgdnMoAPgdKu5ymovdaoIY0VYAI0nAurzPN7aqzYD7QUQqyh0j3iUbnt-1lOTEvQw9ttAmmRMwkVoiVnIq7swkuEY_YIwQSWoiWoLXPWYmnBleUIehLNq416dy1oGQ98GAQnrFT9aNO9KPcQxghPWIOYKUjvVLrDVqomYufjKIHGDyf5hYkIEqGpLWt9liqnQtvqwHzUzW7EPPvtrBDOeZLJJ6Set20asuAwnEHCgVEP1-lHpht1jxFmbixgYqnKhsVhP8UHitkrZiHnNNupYUOSpcKzEgJiSv41q25QDblRyG_nVzYgEH0rPxFCwY-YCh4pS6eWssCb4uSl4Khsi0LKYDYIS8ucK2VoJnRQLqGLWmmP9p8IJ8v_uKkhUAL72UGv59a4IFp75fPWxYcIVAyao4ppmzqCWC-hr2ii7QmBiqLxhELOn6ipb2M03OstBV1nif1eBaxDv3XnpN4K_9NEI2ZQ9e4TcWP03oBOxM' },
  { id: 3, name: 'Планшет', price: 45990, rating: 4.6, image: 'https://avatars.mds.yandex.net/i?id=935271d503ea418afbb2c96b949d5b7a_l-4727286-images-thumbs&n=13' },
  { id: 4, name: 'Наушники', price: 25990, rating: 4.9, image: 'https://img.mvideo.ru/Pdb/50038381b.jpg' },
  { id: 5, name: 'Часы', price: 18990, rating: 4.5, image: 'https://avatars.mds.yandex.net/get-mpic/4501142/2a000001923db73d72513a6187692acfb4a4/orig' },
  { id: 6, name: 'Камера', price: 125990, rating: 4.9, image: 'https://avatars.mds.yandex.net/i?id=0fcbbeec395ab8688fdabee721dae115_l-5886407-images-thumbs&n=13' },
];

function Task3() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Задание 3: Responsive сетка</h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm">
        Откройте <code className="bg-blue-100 px-1 rounded">src/tasks/Task3.tsx</code> и добавьте responsive классы
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow-md p-4">
            <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded" />
            <h3 className="text-lg font-bold mt-3">{p.name}</h3>
            <div className="hidden md:flex mt-2 items-center gap-2">
              <span>⭐ {p.rating}</span>
            </div>
            <p className="text-xl font-bold text-blue-600 mt-2">{p.price.toLocaleString()} ₽</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gray-800 text-white rounded">
        <span className="md:hidden">📱 Mobile</span>
        <span className="hidden md:inline lg:hidden">💻 Tablet</span>
        <span className="hidden lg:inline">🖥 Desktop</span>
      </div>
    </div>
  );
}

export default Task3;
