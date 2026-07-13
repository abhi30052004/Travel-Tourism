from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Destination, Package, DiscoverPage
from app.schemas import (
    DestinationBase, DestinationCreate, DestinationUpdate,
    PackageBase, PackageCreate, PackageUpdate,
    DiscoverPageBase, DiscoverPageCreate, DiscoverPageUpdate
)
from app.routers.auth import require_admin

router = APIRouter(
    prefix="/website",
    tags=["Website Content"]
)

# =====================================================
# DESTINATIONS
# =====================================================

@router.get("/destinations")
def list_destinations(db: Session = Depends(get_db)):
    destinations = db.query(Destination).options(joinedload(Destination.packages)).all()
    return destinations

@router.get("/destinations/{dest_id}")
def get_destination(dest_id: str, db: Session = Depends(get_db)):
    dest = db.query(Destination).filter(Destination.id == dest_id).options(joinedload(Destination.packages)).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    return dest

@router.post("/destinations", response_model=DestinationBase)
def create_destination(payload: DestinationCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    existing = db.query(Destination).filter(Destination.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Destination ID already exists")
    dest = Destination(
        id=payload.id,
        name=payload.name,
        tagline=payload.tagline,
        desc=payload.desc,
        image=payload.image
    )
    db.add(dest)
    db.commit()
    db.refresh(dest)
    return dest

@router.put("/destinations/{dest_id}", response_model=DestinationBase)
def update_destination(dest_id: str, payload: DestinationUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    dest = db.query(Destination).filter(Destination.id == dest_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    if payload.name is not None:
        dest.name = payload.name
    if payload.tagline is not None:
        dest.tagline = payload.tagline
    if payload.desc is not None:
        dest.desc = payload.desc
    if payload.image is not None:
        dest.image = payload.image
        
    db.commit()
    db.refresh(dest)
    return dest

@router.delete("/destinations/{dest_id}")
def delete_destination(dest_id: str, db: Session = Depends(get_db), admin=Depends(require_admin)):
    dest = db.query(Destination).filter(Destination.id == dest_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    db.delete(dest)
    db.commit()
    return {"message": "Destination deleted successfully"}


# =====================================================
# PACKAGES
# =====================================================

@router.get("/packages")
def list_packages(db: Session = Depends(get_db)):
    packages = db.query(Package).all()
    return packages

@router.post("/packages", response_model=PackageBase)
def create_package(payload: PackageCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    dest = db.query(Destination).filter(Destination.id == payload.destination_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    pkg = Package(
        destination_id=payload.destination_id,
        name=payload.name,
        duration=payload.duration,
        price=payload.price,
        image=payload.image,
        highlights=payload.highlights
    )
    db.add(pkg)
    db.commit()
    db.refresh(pkg)
    return pkg

@router.put("/packages/{package_id}", response_model=PackageBase)
def update_package(package_id: int, payload: PackageUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    pkg = db.query(Package).filter(Package.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    
    if payload.destination_id is not None:
        dest = db.query(Destination).filter(Destination.id == payload.destination_id).first()
        if not dest:
            raise HTTPException(status_code=404, detail="Destination not found")
        pkg.destination_id = payload.destination_id
    if payload.name is not None:
        pkg.name = payload.name
    if payload.duration is not None:
        pkg.duration = payload.duration
    if payload.price is not None:
        pkg.price = payload.price
    if payload.image is not None:
        pkg.image = payload.image
    if payload.highlights is not None:
        pkg.highlights = payload.highlights
        
    db.commit()
    db.refresh(pkg)
    return pkg

@router.delete("/packages/{package_id}")
def delete_package(package_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    pkg = db.query(Package).filter(Package.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    db.delete(pkg)
    db.commit()
    return {"message": "Package deleted successfully"}


# =====================================================
# DISCOVER PAGES
# =====================================================

@router.get("/discover")
def list_discover_pages(db: Session = Depends(get_db)):
    pages = db.query(DiscoverPage).all()
    return pages

@router.get("/discover/{disc_id}")
def get_discover_page(disc_id: str, db: Session = Depends(get_db)):
    page = db.query(DiscoverPage).filter(DiscoverPage.id == disc_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Discover page not found")
    return page

@router.post("/discover", response_model=DiscoverPageBase)
def create_discover_page(payload: DiscoverPageCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    existing = db.query(DiscoverPage).filter(DiscoverPage.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Discover page ID already exists")
    page = DiscoverPage(
        id=payload.id,
        title=payload.title,
        tagline=payload.tagline,
        heroImage=payload.heroImage,
        content=payload.content,
        subSections=payload.subSections,
        rules=payload.rules,
        tips=payload.tips
    )
    db.add(page)
    db.commit()
    db.refresh(page)
    return page

@router.put("/discover/{disc_id}", response_model=DiscoverPageBase)
def update_discover_page(disc_id: str, payload: DiscoverPageUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    page = db.query(DiscoverPage).filter(DiscoverPage.id == disc_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Discover page not found")
    
    if payload.title is not None:
        page.title = payload.title
    if payload.tagline is not None:
        page.tagline = payload.tagline
    if payload.heroImage is not None:
        page.heroImage = payload.heroImage
    if payload.content is not None:
        page.content = payload.content
    if payload.subSections is not None:
        page.subSections = payload.subSections
    if payload.rules is not None:
        page.rules = payload.rules
    if payload.tips is not None:
        page.tips = payload.tips
        
    db.commit()
    db.refresh(page)
    return page

@router.delete("/discover/{disc_id}")
def delete_discover_page(disc_id: str, db: Session = Depends(get_db), admin=Depends(require_admin)):
    page = db.query(DiscoverPage).filter(DiscoverPage.id == disc_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Discover page not found")
    db.delete(page)
    db.commit()
    return {"message": "Discover page deleted successfully"}
