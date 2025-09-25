
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, ListGroup, Button, Spinner, Alert } from 'react-bootstrap';
import { supabase } from '../supabaseClient';

interface Menu {
  id: string;
  created_at: string;
  data: {
    shopName: string;
  };
}

export default function ListPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('menus')
        .select('id, created_at, data->shopName')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching menus:', error);
        setError('메뉴 목록을 불러오는 데 실패했습니다.');
        setMenus([]);
      } else if (data) {
        const typedData = data as any[];
        setMenus(typedData.map(item => ({
          id: item.id,
          created_at: item.created_at,
          data: {
            shopName: item.shopName || '이름 없음'
          }
        })));
      }
      setLoading(false);
    };

    fetchMenus();
  }, []);

  const handleDelete = async (menuId: string) => {
    if (window.confirm('정말로 이 메뉴를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', menuId);

      if (error) {
        console.error('Error deleting menu:', error);
        alert('메뉴 삭제 중 오류가 발생했습니다.');
      } else {
        setMenus(menus.filter(menu => menu.id !== menuId));
        alert('메뉴가 성공적으로 삭제되었습니다.');
      }
    }
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>저장된 메뉴 목록</h1>
        <Link to="/" className="btn btn-primary">새 메뉴 만들기</Link>
      </div>

      {loading && <div className="text-center"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {!loading && !error && (
        <ListGroup>
          {menus.length > 0 ? (
            menus.map(menu => (
              <ListGroup.Item key={menu.id} className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">{menu.data.shopName}</h5>
                  <small>
                    ID: {menu.id} | 생성일: {new Date(menu.created_at).toLocaleString()}
                  </small>
                </div>
                <div>
                  <Link to={`/?edit_id=${menu.id}`} className="btn btn-outline-secondary me-2">
                    수정
                  </Link>
                  <Button variant="outline-danger" onClick={() => handleDelete(menu.id)}>
                    삭제
                  </Button>
                </div>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>저장된 메뉴가 없습니다.</ListGroup.Item>
          )}
        </ListGroup>
      )}
    </Container>
  );
}
