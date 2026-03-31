import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, InputGroup, Image } from 'react-bootstrap';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import AppNavbar from '../components/Navbar';

const MenuForm = ({ menuData, setMenuData }: any) => {
  const { session } = useAuth();

  const handleShopInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMenuData({ ...menuData, [name]: value });
  };

  const handleCategoryChange = (catIndex: number, value: string) => {
    const newCategories = [...menuData.categories];
    newCategories[catIndex].name = value;
    setMenuData({ ...menuData, categories: newCategories });
  };

  const handleItemChange = (catIndex: number, itemIndex: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newCategories = [...menuData.categories];
    newCategories[catIndex].items[itemIndex] = { ...newCategories[catIndex].items[itemIndex], [name]: value };
    setMenuData({ ...menuData, categories: newCategories });
  };

  const addCategory = () => {
    setMenuData({
      ...menuData,
      categories: [...menuData.categories, { name: '', items: [{ name: '', dineInPrice: '', takeoutPrice: '', description: '' }] }]
    });
  };

  const removeCategory = (catIndex: number) => {
    if (!window.confirm('이 카테고리를 삭제하시겠습니까?')) return;
    const newCategories = [...menuData.categories];
    newCategories.splice(catIndex, 1);
    setMenuData({ ...menuData, categories: newCategories });
  };

  const addItem = (catIndex: number) => {
    const newCategories = [...menuData.categories];
    newCategories[catIndex].items.push({ name: '', dineInPrice: '', takeoutPrice: '', description: '' });
    setMenuData({ ...menuData, categories: newCategories });
  };

  const removeItem = (catIndex: number, itemIndex: number) => {
    const newCategories = [...menuData.categories];
    newCategories[catIndex].items.splice(itemIndex, 1);
    setMenuData({ ...menuData, categories: newCategories });
  };

  return (
    <div>
      {/* 가게 정보 */}
      <div className="menu-section-card">
        <h6 className="menu-section-title">🏪 가게 정보</h6>
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>가게 이름 <span style={{color: '#e74c3c'}}>*</span></Form.Label>
              <Form.Control
                type="text"
                name="shopName"
                placeholder="예: Gemini's Coffee"
                value={menuData.shopName}
                onChange={handleShopInfoChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label>가게 설명 (선택)</Form.Label>
                {session && <Link to="/list" className="menu-load-btn">📂 저장된 메뉴 불러오기</Link>}
              </div>
              <Form.Control
                as="textarea"
                rows={2}
                name="shopDescription"
                placeholder="손님들께 전하고 싶은 말을 적어보세요."
                value={menuData.shopDescription}
                onChange={handleShopInfoChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>로고 이미지 (URL)</Form.Label>
              <Form.Control type="url" name="shopLogoUrl" placeholder="https://..." value={menuData.shopLogoUrl} onChange={handleShopInfoChange} />
              {menuData.shopLogoUrl && <Image src={menuData.shopLogoUrl} thumbnail className="mt-2" style={{ maxHeight: '80px' }}/>}
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* 메뉴 카테고리 */}
      <div className="menu-section-card">
        <h6 className="menu-section-title">📋 메뉴 구성</h6>

        {menuData.categories.map((category: any, catIndex: number) => (
          <Card key={catIndex} className="menu-category-card">
            <Card.Header className="menu-category-header">
              <InputGroup>
                <InputGroup.Text className="menu-cat-label">카테고리</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="예: 커피, 에이드, 디저트"
                  value={category.name}
                  onChange={(e) => handleCategoryChange(catIndex, e.target.value)}
                />
                <Button variant="outline-danger" size="sm" onClick={() => removeCategory(catIndex)} title="카테고리 삭제">✕</Button>
              </InputGroup>
            </Card.Header>
            <Card.Body className="menu-category-body">
              {/* 헤더 라벨 (PC만 표시) */}
              <Row className="mb-2 d-none d-md-flex menu-item-header">
                <Col md={3}><small>메뉴 이름</small></Col>
                <Col md={2}><small>매장 가격</small></Col>
                <Col md={2}><small>포장 가격</small></Col>
                <Col md={4}><small>설명</small></Col>
                <Col md={1}></Col>
              </Row>

              {category.items.map((item: any, itemIndex: number) => (
                <Row key={itemIndex} className="mb-2 align-items-center menu-item-row">
                  <Col xs={12} md={3} className="mb-1 mb-md-0">
                    <Form.Control size="sm" name="name" placeholder="메뉴 이름" value={item.name} onChange={(e) => handleItemChange(catIndex, itemIndex, e)} />
                  </Col>
                  <Col xs={6} md={2} className="mb-1 mb-md-0">
                    <Form.Control size="sm" name="dineInPrice" placeholder="매장 가격" value={item.dineInPrice} onChange={(e) => handleItemChange(catIndex, itemIndex, e)} />
                  </Col>
                  <Col xs={6} md={2} className="mb-1 mb-md-0">
                    <Form.Control size="sm" name="takeoutPrice" placeholder="포장 가격" value={item.takeoutPrice} onChange={(e) => handleItemChange(catIndex, itemIndex, e)} />
                  </Col>
                  <Col xs={10} md={4} className="mb-1 mb-md-0">
                    <Form.Control size="sm" name="description" placeholder="설명 (선택)" value={item.description} onChange={(e) => handleItemChange(catIndex, itemIndex, e)} />
                  </Col>
                  <Col xs={2} md={1} className="text-end">
                    <Button variant="outline-secondary" size="sm" className="menu-remove-item-btn" onClick={() => removeItem(catIndex, itemIndex)}>−</Button>
                  </Col>
                </Row>
              ))}
              <Button variant="outline-primary" size="sm" className="mt-2 menu-add-item-btn" onClick={() => addItem(catIndex)}>+ 메뉴 추가</Button>
            </Card.Body>
          </Card>
        ))}

        <Button variant="primary" onClick={addCategory} className="w-100 menu-add-cat-btn">+ 카테고리 추가</Button>
      </div>
    </div>
  );
};

export default function MenuPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [finalQrValue, setFinalQrValue] = useState('');
  const qrRef = useRef<any>(null);

  const [menuData, setMenuData] = useState({
    shopName: '',
    shopDescription: '',
    shopLogoUrl: '',
    categories: [{ name: '커피', items: [{ name: '아메리카노', dineInPrice: '5,000원', takeoutPrice: '4,500원', description: '신선한 원두의 깊은 풍미' }] }]
  });

  const [memo, setMemo] = useState('');
  const [memoColor, setMemoColor] = useState('#000000');
  const [memoSize, setMemoSize] = useState('1.25rem');
  const [displayMemo, setDisplayMemo] = useState({ text: '', color: '', size: '' });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editIdParam = params.get('edit_id');
    if (editIdParam && session) {
      setEditId(editIdParam);
      const fetchMenu = async () => {
        const { data, error } = await supabase
          .from('menus')
          .select('data, user_id')
          .eq('id', editIdParam)
          .single();

        if (error) {
          console.error('Error fetching menu:', error);
          alert('메뉴 정보를 불러오는 데 실패했습니다.');
        } else if (data) {
          if (data.user_id !== session.user.id) {
            alert('이 메뉴를 수정할 권한이 없습니다.');
            setEditId(null);
          } else {
            setMenuData(data.data);
          }
        }
      };
      fetchMenu();
    }
  }, [session]);

  const handleDownload = () => {
    if (qrRef.current) {
      toPng(qrRef.current, { cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'menu-qr-code.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => { console.error('oops, something went wrong!', err); });
    }
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisplayMemo({ text: memo, color: memoColor, size: memoSize });
    const baseUrl = window.location.origin;
    const displayUrl = `${baseUrl}/display`;

    if (!session) {
      if (window.confirm('메뉴를 저장하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/auth');
      }
      return;
    }

    const filteredMenuData = {
      ...menuData,
      categories: menuData.categories
        .map(cat => ({
          ...cat,
          items: cat.items.filter(item => item.name.trim() !== '')
        }))
        .filter(cat => cat.name.trim() !== '' && cat.items.length > 0)
    };
    if (filteredMenuData.shopName.trim() === '' || filteredMenuData.categories.length === 0) {
      alert('가게 이름과 하나 이상의 메뉴 항목을 입력해주세요.');
      return;
    }

    if (editId) {
      const { error } = await supabase
        .from('menus')
        .update({ data: filteredMenuData })
        .eq('id', editId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error updating menu data:', error);
        alert('메뉴 수정 중 오류가 발생했습니다.');
        return;
      }

      alert('메뉴가 성공적으로 수정되었습니다.');
      const params = new URLSearchParams({ type: 'menu', id: editId });
      setFinalQrValue(`${displayUrl}?${params.toString()}`);
    } else {
      const { data, error } = await supabase
        .from('menus')
        .insert([{ data: filteredMenuData, user_id: session.user.id }])
        .select();

      if (error) {
        console.error('Error inserting menu data:', error);
        alert('메뉴 저장 중 오류가 발생했습니다.');
        return;
      }

      if (data) {
        const menuId = data[0].id;
        alert('메뉴가 저장되었습니다! QR 코드가 생성되었습니다.');
        const params = new URLSearchParams({ type: 'menu', id: menuId });
        setFinalQrValue(`${displayUrl}?${params.toString()}`);
      }
    }
  };

return (
    <>
      <AppNavbar />
      <section className="generator-section">
        <Container className="main-container">
          <Row>
            <Col>
              <h2 className="text-center main-header">🍽️ 메뉴판 QR 코드 생성기</h2>
              {!session && (
                <div className="menu-login-notice">
                  <span>💡</span>
                  <span>메뉴를 저장하려면 <Link to="/auth">로그인</Link>이 필요합니다.</span>
                </div>
              )}
            </Col>
          </Row>
          <Row>
            <Col md={7}>
              <Form onSubmit={handleGenerate}>
                <MenuForm menuData={menuData} setMenuData={setMenuData} />

                <div className="menu-section-card">
                  <h6 className="menu-section-title">🎨 QR 코드 메모 (선택)</h6>
                  <Form.Control
                    type="text"
                    placeholder="예: 테이블 QR, 매장 입구용"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="mb-2"
                  />
                  <Row>
                    <Col>
                      <Form.Label>텍스트 색상</Form.Label>
                      <Form.Control type="color" value={memoColor} onChange={(e) => setMemoColor(e.target.value)} />
                    </Col>
                    <Col>
                      <Form.Label>텍스트 크기</Form.Label>
                      <Form.Select value={memoSize} onChange={(e) => setMemoSize(e.target.value)}>
                        <option value="1rem">작게</option>
                        <option value="1.25rem">보통</option>
                        <option value="1.5rem">크게</option>
                      </Form.Select>
                    </Col>
                  </Row>
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mt-3"
                  style={{ padding: '0.9rem', fontSize: '1.05rem', fontWeight: 600, borderRadius: 0 }}
                >
                  {editId ? '✏️ 메뉴 수정하기' : '💾 메뉴 저장 및 QR 생성'}
                </Button>
              </Form>
            </Col>
            <Col md={5} className="text-center">
              <div className="qr-code-container d-flex justify-content-center align-items-center">
                <div className="text-center">
                  <h4 className="mb-3">생성된 QR 코드</h4>
                  {finalQrValue ?
                    <>
                      <div ref={qrRef} className="qr-code-wrapper p-3 d-inline-block bg-white">
                        {displayMemo.text && <p className="qr-memo mb-2" style={{ color: displayMemo.color, fontSize: displayMemo.size }}>{displayMemo.text}</p>}
                        <QRCode value={finalQrValue} size={256} />
                      </div>
                      <br />
                      <Button variant="secondary" onClick={handleDownload} className="mt-3" style={{ borderRadius: 0 }}>다운로드</Button>
                    </>
                    :
                    <p className="qr-code-placeholder">메뉴 저장 후 QR 코드가 생성됩니다.</p>
                  }
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}
